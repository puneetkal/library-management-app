import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Review from "@/models/Review"
import jwt from 'jsonwebtoken'

// Get reviews for all chairs in a room
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const roomNumber = searchParams.get('roomNumber')
        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const role = decoded.role
        if (role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        await connectDB()
        if(!roomNumber){
            return NextResponse.json(
                {error: "Room number is required"},
                {status: 400}
            )
        }

        const reviews = await Review.find({ roomNumber })
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
        
        return NextResponse.json({ reviews })

    } catch (error) {
        console.error('Get reviews error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        )
    }
}