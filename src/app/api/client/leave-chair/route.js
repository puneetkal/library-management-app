import connectDB from "@/lib/mongodb"
import jwt from 'jsonwebtoken'
import User from "@/models/User"
import Room from "@/models/Room"
import { NextResponse } from "next/server"

export async function POST(request) {
    try {
        const token = request.cookies.get('token')?.value
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const role = decoded.role
        
        if (role !== 'client') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        await connectDB()
        const { roomNumber, chairNumber } = await request.json()
        const user = await User.findById(decoded.userId)
        if(!user){
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        if(!user.chairOccupied){
            return NextResponse.json({ error: 'You are not occupying any chair' }, { status: 400 })
        }
        if(user.roomNumber !== roomNumber || user.chairNumber !== parseInt(chairNumber)){
            return NextResponse.json({ error: 'You are not occupying this chair' }, { status: 400 })
        }
        user.chairOccupied = false
        user.chairNumber = null
        user.roomNumber = null
        user.occupiedAt = null
        await user.save()
        const room = await Room.findOne({ roomNumber })
        const chair = room.chairs.find(chair => chair.chairNumber === parseInt(chairNumber))
        chair.isOccupied = false
        chair.occupiedBy = null
        chair.occupiedAt = null
        await room.save()
        return NextResponse.json({ message: 'Chair left successfully' }, { status: 200 })

    } catch (error) {
        console.error('Error leaving chair:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
