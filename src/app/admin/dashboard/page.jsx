'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { LogOut, Trash2 } from "lucide-react"

const Page = () => {
    const [rooms, setRooms] = useState([])
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        roomNumber: '',
        capacity: ''
    })
    const router = useRouter()

    useEffect(() => {
        fetch('/api/admin/room')
        .then(res => res.json())
        .then(data =>{
            setRooms(data.rooms)
            localStorage.setItem('rooms', JSON.stringify(data.rooms))
        })
    }, [])

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/signout', {
                method: 'POST'
            })

            if (response.ok) {
                toast.success('Logged out successfully')
                localStorage.removeItem("user")
                router.push('/admin/sign-in')
            } else {
                throw new Error('Failed to logout')
            }
        } catch (error) {
            console.error('Logout error:', error)
            toast.error('Failed to logout')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.roomNumber || !formData.capacity) {
            toast.error('Please fill all the fields')
            return
        }
        if (formData.capacity < 1) {
            toast.error('Capacity must be greater than 0')
            return
        }
        try {
            const res = await fetch('/api/admin/room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (res.ok) {
                setRooms(prev => [...prev, data])
                localStorage.setItem('rooms', JSON.stringify([...rooms, data]))
                setOpen(false)
                setFormData({ roomNumber: '', capacity: '' })
            }
        } catch (error) {
            console.error('Error creating room:', error)
        }
    }

    const handleDelete = async (roomId, e) => {
        e.stopPropagation()
        try {
            const res = await fetch(`/api/admin/room/${roomId}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                setRooms(prev => prev.filter(room => room.roomNumber !== roomId))
                localStorage.setItem('rooms', JSON.stringify(rooms.filter(room => room._id !== roomId)))
                toast.success('Room deleted successfully')
            } else {
                toast.error('Failed to delete room')
            }
        } catch (error) {
            console.error('Error deleting room:', error)
            toast.error('Failed to delete room')
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-4">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Room</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Room</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label htmlFor="roomNumber" className="text-sm font-medium">
                                    Room Number
                                </label>
                                <Input
                                    id="roomNumber"
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        roomNumber: e.target.value
                                    }))}
                                    placeholder="Enter room number"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="capacity" className="text-sm font-medium">
                                    Capacity
                                </label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        capacity: parseInt(e.target.value)
                                    }))}
                                    placeholder="Enter room capacity"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    Create Room
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
                <Button 
                    variant="outline"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {rooms && rooms.map((room) => (
                    <div 
                        key={room._id} 
                        className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
                    >
                        <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => router.push(`/admin/dashboard/${room.roomNumber}`)}
                        >
                            <h3 className="font-medium">Room {room.roomNumber}</h3>
                            <p className="text-sm text-gray-600">Capacity: {room.capacity}</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete Room {room.roomNumber} and all its data.
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-500 hover:bg-red-600"
                                        onClick={(e) => handleDelete(room.roomNumber, e)}
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Page