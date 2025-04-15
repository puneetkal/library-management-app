'use client'

import React, { useState, useEffect } from 'react'
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import Html5QrcodePlugin from '@/components/Html5QrcodePlugin'
import { LogOut, Star, Search, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import StarRating from '@/components/StarRating'

const Page = () => {
    const router = useRouter()
    const [scanning, setScanning] = useState(false)
    const [occupiedChair, setOccupiedChair] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showScanner, setShowScanner] = useState(false)
    const [rating, setRating] = useState(0)
    const [review, setReview] = useState('')
    const [showRatingDialog, setShowRatingDialog] = useState(false)
    const [existingReview, setExistingReview] = useState(null)
    const [allChairReviews, setAllChairReviews] = useState([])
    const [showReviews, setShowReviews] = useState(false)

    useEffect(() => {
        checkExistingOccupancy()
    }, [])

    useEffect(() => {
        if (scanning && !occupiedChair) {
            setShowScanner(true)
        } else {
            setShowScanner(false)
        }
    }, [scanning, occupiedChair])

    useEffect(() => {
        if (occupiedChair) {
            checkExistingReview()
        }
    }, [occupiedChair])

    const checkExistingOccupancy = async () => {
        try {
            const response = await fetch('/api/client/check-occupancy')
            const data = await response.json()
            if (response.ok && data.isOccupying) {
                setOccupiedChair({
                    roomNumber: data.roomNumber,
                    chairIndex: data.chairNumber,
                    occupiedAt: data.occupiedAt
                })
                setScanning(false)
            } else {
                setScanning(true)
            }
        } catch (error) {
            console.error('Error checking occupancy:', error)
            toast.error('Failed to check current occupancy')
            setScanning(true)
        } finally {
            setLoading(false)
        }
    }

    const checkExistingReview = async () => {
        try {
            const response = await fetch(`/api/client/reviews?roomNumber=${occupiedChair.roomNumber}&chairNumber=${occupiedChair.chairIndex}`)
            const data = await response.json()
            
            if (response.ok) {
                // Set all reviews for this chair
                setAllChairReviews(prev => ({
                    ...prev,
                    [occupiedChair.chairIndex]: data.allReviews || []
                }))
            }
        } catch (error) {
            console.error('Error fetching reviews:', error)
        }
    }

    const onNewScanResult = async (decodedText) => {
        try {
            const [roomNumber, chairIndex] = decodedText.split(',')
            
            if (!roomNumber || !chairIndex) {
                throw new Error('Invalid QR code format')
            }

            setScanning(false)

            const response = await fetch('/api/client/occupy-chair', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomNumber,
                    chairNumber: parseInt(chairIndex)
                })
            })

            const data = await response.json()
            if (!response.ok) {
                toast.error(data.error || 'Failed to occupy chair')
            }
            setOccupiedChair({ roomNumber, chairIndex, ...data })
            toast.success('Chair occupied successfully')
        } catch (error) {
            console.error('Error occupying chair:', error)
            toast.error(error.message)
            setScanning(true)
        }
    }

    const handleLeaveChair = async () => {
        try {
            const response = await fetch('/api/client/leave-chair', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomNumber: occupiedChair.roomNumber,
                    chairNumber: occupiedChair.chairIndex
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to leave chair')
            }

            setOccupiedChair(null)
            setTimeout(() => {
                setScanning(true)
            }, 500)
            toast.success('Chair vacated successfully')
        } catch (error) {
            console.error('Error leaving chair:', error)
            toast.error(error.message)
        }
    }

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/signout', {
                method: 'POST'
            })

            if (response.ok) {
                toast.success('Logged out successfully')
                localStorage.removeItem("user")
                router.push('/client/sign-in')
            } else {
                throw new Error('Failed to logout')
            }
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to logout')
        }
    }

    const handleSubmitReview = async () => {
        try {
            const response = await fetch('/api/client/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomNumber: occupiedChair.roomNumber,
                    chairNumber: occupiedChair.chairIndex,
                    rating,
                    comment: review
                })
            })

            if (!response.ok) {
                throw new Error('Failed to submit review')
            }

            const data = await response.json()
            
            // Update the reviews in state by adding the new review to existing ones
            setAllChairReviews(prev => {
                const chairNumber = occupiedChair.chairIndex
                const currentReviews = prev[chairNumber] || []
                return {
                    ...prev,
                    [chairNumber]: [data.review, ...currentReviews]
                }
            })

            toast.success('Review submitted successfully')
            setShowRatingDialog(false)
            // Reset the form
            setRating(0)
            setReview('')
        } catch (error) {
            console.error('Error submitting review:', error)
            toast.error('Failed to submit review')
        }
    }

    const handleDeleteReview = async (reviewId) => {
        try {
            const response = await fetch(`/api/client/reviews/${reviewId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete review')
            }

            // Update the reviews in state by removing the deleted review
            setAllChairReviews(prev => {
                const chairNumber = occupiedChair.chairIndex
                const currentReviews = prev[chairNumber] || []
                return {
                    ...prev,
                    [chairNumber]: currentReviews.filter(review => review._id !== reviewId)
                }
            })

            toast.success('Review deleted successfully')
        } catch (error) {
            console.error('Error deleting review:', error)
            toast.error('Failed to delete review')
        }
    }

    if (loading) {
        return (
            <div className="p-8 max-w-md mx-auto">
                <Card>
                    <CardContent className="py-8">
                        <div className="text-center text-gray-500">
                            Checking current occupancy...
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

  return (
        <div className="">
            <div className="absolute top-4 right-4 flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/client/browse')}
                    className="flex items-center gap-2"
                >
                    <Search className="h-4 w-4" />
                    Browse All Rooms
                </Button>
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
                
            </div>
        
        <div className="relative p-8 max-w-md mx-auto mt-10">
            

            {showScanner ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Scan QR Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Html5QrcodePlugin 
                            fps={10}
                            qrbox={250}
                            disableFlip={true}
                            qrCodeSuccessCallback={onNewScanResult}
                        />
                        <p className="text-sm text-gray-500 text-center mt-4">
                            Point your camera at a chair&apos;s QR code
                        </p>
                    </CardContent>
                </Card>
            ) : occupiedChair ? (
                <>
                <Card className="mb-6 w-max">
                    <CardHeader>
                        <CardTitle>Currently Occupied Chair</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-lg">Room {occupiedChair.roomNumber}, Chair {occupiedChair.chairIndex}</p>
                            </div>
                            <div className="flex gap-4">
                                <Button onClick={() => setShowRatingDialog(true)}>
                                    Add Review
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowReviews(true)}
                                >
                                    View All Reviews ({allChairReviews[occupiedChair?.chairIndex]?.length || 0})
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={handleLeaveChair}
                                >
                                    Leave Chair
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            

            {/* Reviews Dialog */}
            <Dialog open={showReviews} onOpenChange={setShowReviews}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Reviews for Chair {occupiedChair?.chairIndex} in Room {occupiedChair?.roomNumber}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                        {loading ? (
                            <div className="text-center py-4 text-gray-500">
                                Loading reviews...
                            </div>
                        ) : !allChairReviews[occupiedChair?.chairIndex]?.length ? (
                            <div className="text-center py-4 text-gray-500">
                                No reviews yet for this chair.
                            </div>
                        ) : (
                            allChairReviews[occupiedChair?.chairIndex].map((review) => (
                                <div key={review._id} className="space-y-2 pb-4 border-b last:border-0">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
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
                                        {review.userId._id === JSON.parse(localStorage.getItem("user")).id && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDeleteReview(review._id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rating and Review Section */}
            <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Rate & Review Chair
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex justify-center">
                            <StarRating 
                                rating={rating} 
                                onRatingChange={setRating} 
                            />
                        </div>
                        <Textarea
                            placeholder="Write your review here..."
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRatingDialog(false)
                                setRating(0)
                                setReview('')
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={!rating || !review.trim()}
                        >
                            Submit Review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </>
            ) : null}
        </div>
        </div>
    )
}

export default Page
