import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    try {
        
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        await connectDB()
        const user = await User.findById(decoded.userId)
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Create response with success message
        const response = NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
        )

        // Clear the token cookie
        response.cookies.set({
            name: 'token',
            value: '',
            expires: new Date(0),
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        })

        return response

    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        )
    }
}