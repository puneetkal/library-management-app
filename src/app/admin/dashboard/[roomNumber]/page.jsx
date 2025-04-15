'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ChevronLeft, Star } from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

const Page = () => {
    const { roomNumber } = useParams()
    const router = useRouter()
    const [room, setRoom] = useState(null)
    const [selectedChair, setSelectedChair] = useState(null)
    const [showReviews, setShowReviews] = useState(false)
    const [allReviews, setAllReviews] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRoomAndReviews()
    }, [roomNumber])

    const fetchRoomAndReviews = async () => {
        try {
            // Get room from localStorage
            const rooms = JSON.parse(localStorage.getItem('rooms'))
            const room = rooms.find(room => room.roomNumber === roomNumber)
            setRoom(room)

            // Fetch only reviews from API
            const reviewsResponse = await fetch(`/api/admin/reviews?roomNumber=${roomNumber}`)
            const reviewsData = await reviewsResponse.json()

            if (reviewsResponse.ok) {
                // Organize reviews by chair number
                const reviewsByChair = reviewsData.reviews.reduce((acc, review) => {
                    const chairNumber = review.chairNumber
                    if (!acc[chairNumber]) {
                        acc[chairNumber] = []
                    }
                    acc[chairNumber].push(review)
                    return acc
                }, {})
                setAllReviews(reviewsByChair)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getOccupancyStats = (chairs) => {
        if (!chairs) return { occupied: 0, total: 0 }
        const occupied = chairs.filter(chair => chair.isOccupied).length
        const total = chairs.length
        return { occupied, total }
    }

    const handleChairClick = (chair) => {
        setSelectedChair(chair)
        setShowReviews(true)
    }

    if (!room) {
        return (
            <div className="p-8 max-w-7xl mx-auto text-center">
                <h1 className="text-2xl font-bold mb-4">Room not found</h1>
                <p className="text-gray-500">The requested room could not be found.</p>
            </div>
        )
    }

    const { occupied, total } = getOccupancyStats(room.chairs)

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <Button
                variant="ghost"
                className="mb-6 flex items-center gap-2 hover:bg-gray-100"
                onClick={() => router.back()}
            >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
            </Button>

            <div className="mb-8 flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">Room {roomNumber}</h1>
                    <p className="text-gray-500">
                        {occupied} of {total} seats occupied
                    </p>
                </div>
                <Badge 
                    variant={occupied === total ? "destructive" : occupied === 0 ? "secondary" : "default"}
                    className="text-sm"
                >
                    {occupied === total ? "Full" : occupied === 0 ? "Empty" : "Partial"}
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Seating Layout</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
                        {room.chairs.map((chair) => (
                            <TooltipProvider key={chair._id}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <div 
                                            className={`
                                                aspect-square rounded-lg p-4
                                                flex items-center justify-center
                                                text-white font-medium
                                                ${chair.isOccupied 
                                                    ? 'bg-red-500 hover:bg-red-600' 
                                                    : 'bg-green-500 hover:bg-green-600'
                                                } 
                                                transition-all duration-200
                                                transform hover:scale-105
                                                cursor-pointer
                                            `}
                                            onClick={() => handleChairClick(chair)}
                                        >
                                            {chair.chairNumber}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="space-y-1">
                                            <p className="font-medium">Chair {chair.chairNumber}</p>
                                            {chair.isOccupied ? (
                                                <>
                                                    <p className="text-xs">Occupied</p>
                                                    {chair.occupiedAt && (
                                                        <p className="text-xs">
                                                            Since: {new Date(chair.occupiedAt).toLocaleTimeString()}
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-xs">Available</p>
                                            )}
                                            <p className="text-xs text-blue-500">Click to view reviews</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showReviews} onOpenChange={setShowReviews}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Reviews for Chair {selectedChair?.chairNumber}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-4 text-gray-500">
                                Loading reviews...
                            </div>
                        ) : !allReviews[selectedChair?.chairNumber]?.length ? (
                            <div className="text-center py-4 text-gray-500">
                                No reviews yet for this chair.
                            </div>
                        ) : (
                            allReviews[selectedChair?.chairNumber].map((review) => (
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

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Room Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm text-gray-500">Room Number</dt>
                                <dd className="text-lg font-medium">{room.roomNumber}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Total Capacity</dt>
                                <dd className="text-lg font-medium">{room.capacity}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500">Available Seats</dt>
                                <dd className="text-lg font-medium">{total - occupied}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Occupancy Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${(occupied / total) * 100}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                {Math.round((occupied / total) * 100)}% occupied
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Page