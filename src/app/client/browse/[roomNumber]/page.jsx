'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, Star } from "lucide-react"

const ChairCard = ({ chair, reviews }) => {
    const [showReview, setShowReview] = useState(false)
    const chairReviews = reviews.filter(review => review.chairNumber === chair.chairNumber)
    const averageRating = chairReviews.length > 0
        ? chairReviews.reduce((acc, r) => acc + r.rating, 0) / chairReviews.length
        : 0

    return (
        <>
            <div
                className={`
                    aspect-square rounded-lg p-4
                    flex flex-col items-center justify-center
                    cursor-pointer
                    ${chair.isOccupied
                        ? 'bg-red-100 hover:bg-red-200'
                        : 'bg-green-100 hover:bg-green-200'
                    }
                    transition-colors
                `}
                onClick={() => setShowReview(true)}
            >
                <span className="text-lg font-medium">Chair {chair.chairNumber}</span>
                {chairReviews.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{averageRating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({chairReviews.length})</span>
                    </div>
                )}
            </div>

            <Dialog open={showReview} onOpenChange={setShowReview}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Chair {chair.chairNumber} Reviews</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                        {chairReviews.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                No reviews yet for this chair.
                            </div>
                        ) : (
                            chairReviews.map((review) => (
                                <div key={review._id} className="space-y-2 pb-4 border-b last:border-0">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${
                                                    i < review.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-600">{review.comment}</p>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>By: {review.userId.name}</span>
                                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

const Page = () => {
    const { roomNumber } = useParams()
    const router = useRouter()
    const [room, setRoom] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRoomDetails()
    }, [roomNumber])

    const fetchRoomDetails = async () => {
        try {
            const [roomResponse, reviewsResponse] = await Promise.all([
                fetch(`/api/client/rooms/${roomNumber}`),
                fetch(`/api/client/reviews?roomNumber=${roomNumber}`)
            ])

            if (!roomResponse.ok || !reviewsResponse.ok) {
                throw new Error('Failed to fetch data')
            }

            const [roomData, reviewsData] = await Promise.all([
                roomResponse.json(),
                reviewsResponse.json()
            ])

            setRoom(roomData.room)
            setReviews(reviewsData.reviews)
        } catch (error) {
            console.error('Error fetching room details:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="max-w-4xl mx-auto animate-pulse">
                    <div className="h-8 bg-gray-100 w-1/3 mb-8 rounded" />
                    <div className="grid grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-100 rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!room) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold">Room not found</h2>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-6 flex items-center gap-2"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Rooms
                </Button>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Room {roomNumber}</CardTitle>
                    </CardHeader>


                    <CardContent>
                        <div className="text-sm text-gray-500 flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-100 rounded" />
                                <span>Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-100 rounded" />
                                <span>Occupied</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {room.chairs.map((chair) => (
                                <ChairCard 
                                    key={chair.chairNumber} 
                                    chair={chair}
                                    reviews={reviews}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>


            </div>
        </div>
    )
}

export default Page
