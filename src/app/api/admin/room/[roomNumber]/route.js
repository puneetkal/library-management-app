import Room from "@/models/Room"
import { NextResponse } from "next/server"
import jwt from 'jsonwebtoken'
import connectDB from "@/lib/mongodb"

export async function DELETE(request, context) {
    try {
        const roomNumber = context.params.roomNumber
        const token = request.cookies.get('token')?.value
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const role = decoded.role
        
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await connectDB()
        const room = await Room.findOne({ roomNumber })
        
        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 })
        }

        let canDelete = true;
        room.chairs.forEach(chair => {
            if (chair.isOccupied) {
                canDelete = false;
            }
        })

        if (!canDelete) {
            return NextResponse.json({ error: 'Room is not empty' }, { status: 400 })
        }

        await Room.deleteOne({ roomNumber })
        return NextResponse.json({ message: 'Room deleted successfully' }, { status: 200 }) 
    } catch (error) {
        console.error('Delete room error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

