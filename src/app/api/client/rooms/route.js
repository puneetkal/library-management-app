import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
const Room = require('@/models/Room')
import connectDB from '@/lib/mongodb'

export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const role = decoded.role
        if (role !== 'client') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        await connectDB()
        const rooms = await Room.find()
        return NextResponse.json({rooms}, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}