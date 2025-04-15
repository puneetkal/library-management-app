import React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const page = () => {
  const router = useRouter()
  useEffect(() => {
    router.push('/admin/sign-in')
  }, [])
  return (
    <div></div>
  )
}

export default page