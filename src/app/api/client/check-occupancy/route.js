import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import jwt from 'jsonwebtoken'
import User from "@/models/User"

export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const role = decoded.role
        
        if (role !== 'client') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        await connectDB()
        const user = await User.findById(decoded.userId)
        if(!user){
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        if(user.chairOccupied){
            return NextResponse.json({
                isOccupying: true,
                roomNumber: user.roomNumber,
                chairNumber: user.chairNumber,
                occupiedAt: user.occupiedAt
            })
        }
        return NextResponse.json({
            isOccupying: false,
        })

    } catch (error) {
        console.error('Check occupancy error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        )
    }
}