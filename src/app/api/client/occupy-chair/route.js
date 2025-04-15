import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import Room from '@/models/Room'
import User from '@/models/User'

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
        const room = await Room.findOne({ roomNumber })
        const user = await User.findById(decoded.userId)
        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 })
        }
        const chair = room.chairs.find(chair => chair.chairNumber === chairNumber)
        if (!chair) {
            return NextResponse.json({ error: 'Chair not found' }, { status: 404 }) 
        }
        if (chair.isOccupied) {
            if(chair.userId === decoded.userId) {
                return NextResponse.json({ message: 'Chair Occupied by you', OccupiedBy: decoded.userId }, { status: 200 })
            }else{
                return NextResponse.json({ error: 'Chair already occupied' }, { status: 400 })
            }
        }
        chair.isOccupied = true
        chair.occupiedBy = decoded.userId
        chair.occupiedAt = new Date()
        user.chairOccupied = true
        user.chairNumber = chairNumber
        user.roomNumber = roomNumber
        user.occupiedAt = new Date()
        await room.save() 
        await user.save()
        return NextResponse.json({ message: 'Chair occupied successfully' }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

