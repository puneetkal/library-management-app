import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Review from "@/models/Review"
import jwt from 'jsonwebtoken'

export async function DELETE(request, {params}) {
    try {

        const param = await params
        const reviewId = await param.reviewId

        const token = request.cookies.get('token')?.value
        console.log('token', token)
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const role = decoded.role
        
        if (role !== 'client') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        await connectDB()

        const review = await Review.findById(reviewId)
        console.log('review', review)
        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        // Check if the user owns this review
        if (review.userId.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        await Review.findByIdAndDelete(reviewId)
        
        return NextResponse.json({ message: 'Review deleted successfully' })

    } catch (error) {
        console.error('Delete review error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        )
    }
}