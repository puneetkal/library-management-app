'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Users, Star, LayoutDashboard } from "lucide-react"

const Page = () => {
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchRooms()
    }, [])

    const fetchRooms = async () => {
        try {
            const response = await fetch('/api/client/rooms')
            const data = await response.json()
            setRooms(data.rooms)
        } catch (error) {
            console.error('Error fetching rooms:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="max-w-4xl mx-auto grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between">
                <h1 className="text-3xl font-bold mb-8">Browse Rooms</h1>
                <Button 
                        onClick={() => router.push('/client/dashboard')}
                        className="flex items-center gap-2"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Scan to book a chair
                    </Button>
                    </div>
                <div className="grid gap-4">
                    {rooms.map((room) => {
                        const occupiedChairs = room.chairs.filter(chair => chair.isOccupied).length
                        const totalReviews = room.chairs.filter(chair => chair.review).length
                        const averageRating = room.chairs.reduce((acc, chair) => {
                            return chair.review ? acc + chair.review.rating : acc
                        }, 0) / (totalReviews || 1)

                        return (
                            <Card 
                                key={room._id}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => router.push(`/client/browse/${room.roomNumber}`)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold mb-2">
                                                Room {room.roomNumber}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    <span>{occupiedChairs}/{room.capacity} occupied</span>
                                                </div>
                                                {totalReviews > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        <span>{averageRating.toFixed(1)} ({totalReviews} reviews)</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="text-primary">
                                            View Details →
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Page