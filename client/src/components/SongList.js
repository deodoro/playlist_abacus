import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { playSong, pollSpotifyState } from '../utils/api'
import { useDevice } from '../context/DeviceContext'
import { updatePlayingStatus } from '../utils/helpers'
import { useNavigate } from 'react-router-dom'

const SongList = ({
   songs,
   selectedSong,
   selectSong,
   repeats,
   songRefs,
   setSongs,
}) => {
   const [hoveredSong, setHoveredSong] = useState(null)
   const { activeDeviceId } = useDevice()
   const navigate = useNavigate()

   useEffect(() => {
      const pollInterval = setInterval(async () => {
         try {
            const { uri, _position } = await pollSpotifyState()
            const playingSong = Object.values(songs)
               .flat()
               .find((song) => song.playing)?.uri

            if (uri !== playingSong) {
               setSongs((prevSongs) => {
                  const updatedSongs = { ...prevSongs }
                  Object.keys(updatedSongs).forEach((playlistId) => {
                     updatedSongs[playlistId] = updatedSongs[playlistId].map(
                        (song) => ({
                           ...song,
                           playing: song.uri === uri,
                        })
                     )
                  })
                  return updatedSongs
               })
            }
         } catch (error) {
            if (error.name === 'UnauthorizedError') {
               navigate('/') // Redirect to home route on 401
            } else {
               console.error('Error polling Spotify state:', error)
            }
         }
      }, 5000) // Poll every 30 seconds

      return () => clearInterval(pollInterval) // Clean up on unmount
   }, [songs, setSongs, navigate])

   const handleDragStart = (e, song) => {
      e.dataTransfer.setData('song', JSON.stringify(song))
      e.dataTransfer.setData('playlist', 'master')
   }

   const handlePlayClick = (song_uri) => {
      setSongs((prev) => updatePlayingStatus(prev, song_uri))
      playSong(song_uri, activeDeviceId)
   }

   return (
      <ul className='divide-y divide-gray-300 px-2'>
         {songs.map((song, index) => (
            <li
               key={index}
               className={`px-2 relative flex items-center justify-between cursor-pointer py-2 ${
                  repeats.some((r) => r.uri === song.uri) &&
                  selectedSong?.uri !== song.uri
                     ? 'text-orange-300 font-[400]'
                     : 'text-gray-800'
               } ${
                  selectedSong?.uri === song.uri
                     ? 'bg-blue-600 text-white'
                     : 'hover:bg-gray-400'
               } ${song.playing ? 'font-[900]' : ''}`}
               onClick={() => selectSong(song)}
               ref={(el) => {
                  if (!songRefs.current[song.uri]) {
                     songRefs.current[song.uri] = []
                  }
                  songRefs.current[song.uri].push(el)
               }}
               onDragStart={(e) => handleDragStart(e, song)}
               draggable
               onMouseEnter={() => setHoveredSong(song.uri)}
               onMouseLeave={() => setHoveredSong(null)}
            >
               {song.playing && (
                  <div className='absolute inset-0 bg-yellow-500 opacity-20 pointer-events-none'></div>
               )}

               <div className='flex-shrink-0'>
                  {hoveredSong === song.uri ? (
                     <button
                        onClick={(e) => {
                           e.stopPropagation() // Prevent triggering selectSong when button is clicked
                           handlePlayClick(song.uri)
                        }}
                        className='w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full'
                     >
                        ▶
                     </button>
                  ) : (
                     <img
                        src={song.image || 'https://via.placeholder.com/40'}
                        alt={song.name}
                        className='w-10 h-10 rounded-full'
                     />
                  )}
               </div>

               {/* Middle Section: Song Details */}
               <div className='flex flex-col flex-1 px-4 truncate'>
                  <span
                     className={`text-wrap ${
                        selectedSong?.uri === song.uri ? 'text-white' : ''
                     }`}
                  >
                     {song.name}
                  </span>
                  <span
                     className={`text-sm text-wrap ${
                        selectedSong?.uri === song.uri
                           ? 'text-gray-400'
                           : 'opacity-60'
                     }`}
                  >
                     {song.artist}
                  </span>
               </div>

               {/* Right Section: Song Duration */}
               <div className={'text-gray-300 text-sm font-semibold'}>
                  {Math.floor(song.duration / 60)}:
                  {Math.floor(song.duration % 60)
                     .toString()
                     .padStart(2, '0')}
               </div>
            </li>
         ))}
      </ul>
   )
}

SongList.propTypes = {
   songs: PropTypes.array.isRequired,
   selectedSong: PropTypes.object,
   selectSong: PropTypes.func.isRequired,
   repeats: PropTypes.array.isRequired,
   songRefs: PropTypes.object.isRequired,
   setSongs: PropTypes.func.isRequired,
}

export default SongList
