import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const NotFound = () => {
  const navigate = useNavigate()

  useEffect(() => {
    toast.info('Redirecting to Home Page in 3 seconds...', {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
    })

    const timeout = setTimeout(() => {
      navigate('/')
    }, 3000)

    return () => clearTimeout(timeout)
  }, [navigate])

  return (
    <div className="flex items-center justify-center h-screen bg-white">
    <iframe src="https://lottie.host/embed/2f1c4035-a5b4-4c91-9edb-5ddc5d18061d/lFslTT0Ao3.lottie"></iframe>
    </div>
  )
}

export default NotFound
