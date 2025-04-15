import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true
    },
    chairNumber: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Compound index to ensure one review per user per chair
// reviewSchema.index({ roomNumber: 1, chairNumber: 1, userId: 1 }, { unique: true })

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema)

export default Review
