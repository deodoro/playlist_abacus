import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
   getUserProfile,
   getAvailableDevices,
   setActiveDevice,
} from '../utils/api'
import { useDevice } from '../context/DeviceContext' // Import useDevice hook
import { useNavigate } from 'react-router-dom'

const UserDeviceSelector = () => {
   const [user, setUser] = useState(null)
   const [devices, setDevices] = useState([])
   const { activeDeviceId, setActiveDeviceId } = useDevice()
   const navigate = useNavigate()

   useEffect(() => {
      const loadData = async () => {
         try {
            const profile = await getUserProfile()
            setUser(profile)

            const deviceData = await getAvailableDevices()
            setDevices(deviceData.devices)
            setActiveDeviceId(deviceData.activeDeviceId)
            console.log('Active device ID:', deviceData.activeDeviceId)
         } catch (error) {
            if (error.name === 'UnauthorizedError') {
               navigate('/') // Redirect to home route on 401
            } else {
               console.error('Failed to load user or devices:', error)
            }
         }
      }

      loadData()
   }, [setActiveDeviceId, navigate])

   const handleDeviceChange = async (e) => {
      const newDeviceId = e.target.value
      setActiveDeviceId(newDeviceId)
      console.log('Active device ID:', newDeviceId)
      try {
         await setActiveDevice(newDeviceId)
      } catch (error) {
         console.error('Failed to set active device:', error)
      }
   }

   return (
      <div className='p-4'>
         {/* User Profile */}
         {user && (
            <div className='flex items-center mb-4'>
               <img
                  src={user.picture || 'https://via.placeholder.com/40'}
                  alt='User Avatar'
                  className='w-10 h-10 rounded-full mr-3'
               />
               <div>
                  <p className='font-semibold'>{user.name}</p>
                  <p className='text-sm text-gray-500'>{user.email}</p>
               </div>
            </div>
         )}

         {/* Device Selector */}
         <label
            htmlFor='deviceSelect'
            className='block text-sm font-medium text-gray-700'
         >
            Active Device
         </label>
         <select
            id='deviceSelect'
            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
            value={activeDeviceId}
            onChange={handleDeviceChange}
         >
            {devices.length > 0 ? (
               devices.map((device) => (
                  <option key={device.id} value={device.id}>
                     {device.name}
                  </option>
               ))
            ) : (
               <option value=''>No devices available</option>
            )}
         </select>
      </div>
   )
}

UserDeviceSelector.propTypes = {
   onDeviceChange: PropTypes.func,
}

export default UserDeviceSelector
