import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Room from "@/models/Room"
import jwt from 'jsonwebtoken'

export async function GET(request, { params }) {
    try {
        const token = request.cookies.get('token')?.value
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const role = decoded.role
        if (role !== 'client') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const param = await params
        const { roomNumber } = await param
        await connectDB()
        
        const room = await Room.findOne({ roomNumber })
        
        if (!room) {
            return NextResponse.json(
                { error: 'Room not found' }, 
                { status: 404 }
            )
        }

        return NextResponse.json({ room })
    } catch (error) {
        console.error('Error fetching room:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        )
    }
}