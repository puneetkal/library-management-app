import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Review from "@/models/Review"
import jwt from 'jsonwebtoken'

// Get reviews for all chairs in a room
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const roomNumber = searchParams.get('roomNumber')
        const chairNumber = searchParams.get('chairNumber')
        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        await connectDB()
        if(!roomNumber){
            return NextResponse.json(
                {error: "Room number is required"},
                {status: 400}
            )
        }

        if (chairNumber) {
            // Get specific user's review for a chair
            const userReview = await Review.findOne({
                roomNumber,
                chairNumber: parseInt(chairNumber),
                userId: decoded.id
            })

            // Get all reviews for this chair
            const allChairReviews = await Review.find({
                roomNumber,
                chairNumber: parseInt(chairNumber)
            }).populate('userId', 'name')

            return NextResponse.json({
                allReviews: allChairReviews // All reviews for this chair
            })
        }

        // If no chairNumber, return all reviews for the room
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

// Create a new review
export async function POST(request) {
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
        const body = await request.json()
        const { roomNumber, chairNumber, rating, comment } = body

        await connectDB()

        // Check if user already reviewed this chair
        // const existingReview = await Review.findOne({
        //     roomNumber,
        //     chairNumber,
        //     userId: decoded.id
        // })

        // if (existingReview) {
        //     return NextResponse.json(
        //         { error: 'You have already reviewed this chair' }, 
        //         { status: 400 }
        //     )
        // }

        const review = await Review.create({
            roomNumber,
            chairNumber,
            userId: decoded.userId,
            rating,
            comment
        })

        return NextResponse.json({ 
            success: true,
            review: {
                _id: review._id,
                rating,
                comment,
                chairNumber,
                roomNumber,
                userId: { 
                    _id: decoded.id,
                    name: decoded.name 
                },
                createdAt: review.createdAt
            }
        })

    } catch (error) {
        console.error('Submit review error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        )
    }
}
