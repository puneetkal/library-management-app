import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
const Room = require('@/models/Room')
import connectDB from '@/lib/mongodb'

export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const role = decoded.role
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        await connectDB()
        const rooms = await Room.find()
        return NextResponse.json({rooms}, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const token = request.cookies.get('token')?.value
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const role = decoded.role
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { roomNumber, capacity } = await request.json()
        if (!roomNumber || !capacity) {
            return NextResponse.json({ error: 'Room number and capacity are required' }, { status: 400 })
        }
        const roomAlreadyExists = await Room.findOne({ roomNumber })
        if (roomAlreadyExists) {
            return NextResponse.json({ error: 'Room already exists' }, { status: 400 })
        }
        await connectDB()
        const chairs = Array.from({ length: capacity }, (_, index) => ({
            chairNumber: index + 1,
            isOccupied: false,
            occupiedBy: null,
            occupiedAt: null
          }));
      
          const room = await Room.create({ roomNumber, capacity, chairs })
          await room.save();
        return NextResponse.json(room, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}


