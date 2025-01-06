import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Operations from '../utils/operations'

const PlaylistDetails = ({
   playlist,
   playlists,
   setPlaylists,
   songs,
   repeats,
   selectedSong,
   setSelectedSong,
   setSongs,
   songRefs,
   setSteps,
   setSelectedPlaylists,
}) => {
   const [length, setLength] = useState('0:00')
   const [dragOver, setDragOver] = useState('');
   const [dragInsertPosition, setDragInsertPosition] = useState(null); // New state to track insert position

   useEffect(() => {
      if (songs) {
         const hours = songs.reduce((acc, { duration }) => acc + duration, 0)
         setLength(
            `${Math.floor(hours / 3600)}:${String(
               Math.floor(hours / 60) % 60
            ).padStart(2, '0')}`
         )
      } else setLength('0:00')
   }, [songs])

   const handleDragStart = (e, song) => {
      e.dataTransfer.setData('song', JSON.stringify(song))
      e.dataTransfer.setData('playlist', playlist.id)
   }

   const handleDrop = (e) => {
      const song = JSON.parse(e.dataTransfer.getData('song'))
      const sourceIndex = song.index
      const origPlaylistId = e.dataTransfer.getData('playlist')
      const targetSongIndex =
         e.target.parentElement.dataset.index
      const targetIndex =
         targetSongIndex !== undefined
            ? parseInt(targetSongIndex, 10)
            : songs[playlist.id].length
      const isMove = origPlaylistId !== 'master' && e.shiftKey
      const transactionId = String(Date.now())

      setSteps((prevSteps) => {
         const insertOp = {
            op: Operations.OP_INSERT,
            playlistId: playlist.id,
            song,
            index: targetIndex,
            tId: transactionId,
         }

         if (origPlaylistId === 'master' || playlist.id !== origPlaylistId) {
            return isMove
               ? [
                    ...prevSteps,
                    {
                       op: Operations.OP_REMOVE,
                       playlistId: origPlaylistId,
                       song,
                       index: sourceIndex,
                       tId: transactionId,
                    },
                    { ...insertOp },
                 ]
               : [...prevSteps, insertOp]
         } else {
            return [
               ...prevSteps,
               {
                  op: Operations.OP_MOVE,
                  playlistId: playlist.id,
                  song,
                  fromIndex: sourceIndex,
                  toIndex: sourceIndex < targetIndex ? targetIndex + 1 : targetIndex + 2,
                  tId: transactionId,
               },
            ]
         }
      })

      setSongs((prevSongs) => {
         const updatedSongs = { ...prevSongs }
         const updateIndexes = (list, start) => {
            const newItems = list.slice(start).map((i, index) => { return { ...i, index: start + index } })
            return list.slice(0, start).concat(newItems)
         }

         if (origPlaylistId === 'master' || playlist.id !== origPlaylistId) {
            const newIndex = targetIndex + 1
            updatedSongs[playlist.id].splice(newIndex, 0, song)
            updatedSongs[playlist.id] = updateIndexes(updatedSongs[playlist.id], newIndex)
            if (isMove) {
               updatedSongs[origPlaylistId].splice(sourceIndex, 1)
               updatedSongs[origPlaylistId] = updateIndexes(updatedSongs[origPlaylistId], sourceIndex)
            }
         } else {
            const newIndex =
               sourceIndex < targetIndex ? targetIndex + 1 : targetIndex + 2
            updatedSongs[playlist.id].splice(sourceIndex, 1)
            updatedSongs[playlist.id].splice(newIndex - 1, 0, song)
            updatedSongs[playlist.id] = updateIndexes(
               updatedSongs[playlist.id],
               Math.min(sourceIndex, targetIndex)
            )
         }

         return updatedSongs
      })
   }

   const cloneList = async () => {
      const newPlaylistName = prompt('Enter the new playlist name:')
      if (!newPlaylistName) return

      const newPlaylist = { id: `${Date.now()}`, name: newPlaylistName }
      setPlaylists((prev) => [...prev, newPlaylist])
      setSongs((prev) => ({
         ...prev,
         [newPlaylist.id]: songs.map((song, index) => ({ ...song, index })),
      }))
      setSteps((prev) => [
         ...prev,
         {
            op: Operations.OP_NEW_PLAYLIST,
            playlist: newPlaylist,
            uris: songs.map((song) => song.uri),
            tId: String(Date.now()),
         },
      ])
   }

   const handleDeleteList = () => {
      setSteps((prev) => [
         ...prev,
         {
            op: Operations.OP_DELETE_PLAYLIST,
            playlist: playlist,
            songs: [...songs],
            tId: String(Date.now()),
         },
      ])
      setPlaylists((prev) => prev.filter((p) => p.id !== playlist.id))
      setSongs((prev) => {
         const { [playlist.id]: _, ...rest } = prev
         return rest
      })
      setSelectedPlaylists((prev) => prev.filter((p) => p.id !== playlist.id))
   }

   const handleDeleteSong = (song) => {
      setSteps((prev) => [
         ...prev,
         {
            op: Operations.OP_REMOVE,
            playlistId: playlist.id,
            song: song,
            tId: String(Date.now()),
         },
      ])
      setSongs((prev) => {
         const updatedSongs = { ...prev }
         updatedSongs[playlist.id].splice(song.index, 1)
         for (let i = song.index; i < updatedSongs[playlist.id].length; i++) {
            updatedSongs[playlist.id][i].index = i
         }
         return updatedSongs
      })
   }

   const handleDeselect = () => {
      setSelectedPlaylists((prev) => prev.filter((p) => p.id !== playlist.id))
   }

   return (
      <div
         className='bg-gray-100 p-4 rounded-md shadow-md h-[50vh] pt-0'
         onDragOver={(e) => e.preventDefault()}
        //  onDrop={handleDrop}
      >
         <div className='flex flex-col h-full'>
            <div className=''>
               <h3 className='sticky top-0 z-10 pt-6 bg-gray-100 text-lg font-semibold text-gray-800 flex items-center justify-between pb-2'>
                  {playlist.name}
                  <span className='text-xs text-gray-400'>
                     {songs?.length || 0} songs
                  </span>
                  <span className='text-xs text-gray-400'>{length} hours</span>
                  <div className='flex space-x-2 text-xs'>
                     <button
                        className='text-green-600 hover:underline'
                        onClick={cloneList}
                     >
                        Clone
                     </button>
                     <button
                        className='text-red-500 hover:underline'
                        onClick={handleDeleteList}
                     >
                        Delete
                     </button>
                     <button
                        className='text-blue-500 hover:underline'
                        onClick={handleDeselect}
                     >
                        Deselect
                     </button>
                  </div>
               </h3>
            </div>
            <div className='flex-1 overflow-y-auto'>
               <ul className='divide-y divide-gray-200'>
                  {songs?.map((song, index) => (
                     <React.Fragment key={index}>
                        <li
                           className={`song-detail-item text-gray-600 flex items-center p-2 rounded-md relative ${
                                 selectedSong?.uri === song.uri
                                 ? 'bg-blue-500 text-white'
                                 : repeats.some((r) => r.uri === song.uri)
                                 ? 'text-orange-300 font-[400]'
                                 : ''
                           }`}
                           draggable
                           ref={(el) => {
                              if (!songRefs.current[song.uri])
                                 songRefs.current[song.uri] = []
                              songRefs.current[song.uri].push(el)
                           }}
                           onDragStart={(e) => handleDragStart(e, song)}
                           onClick={() => setSelectedSong(song)}
                           data-index={index}
                           onDragEnter={() => {
                              setDragOver(song.uri)
                              setDragInsertPosition(index) // Set insert position
                           }}
                           onDragOver={(e) => e.preventDefault()} // Prevent default to allow drop
                           onDragLeave={() => {
                              if (dragOver === song.uri) {
                                 setDragOver('')
                                 setDragInsertPosition(null) // Reset insert position
                              }
                           }}
                           onDrop={(e) => {
                              setDragOver('')
                              setDragInsertPosition(null) // Reset on drop
                              handleDrop(e)
                           }}
                        >
                           {/* Song Index and Name */}
                           <div className='flex-1 break-words'>
                              {song.index + 1}. {song.name}
                           </div>

                           {/* Song Artist */}
                           <div className='flex-1 break-words'>
                              {song.artist}
                           </div>

                           {/* Song Duration */}
                           <div className='w-16 text-sm text-right'>
                              {Math.floor(song.duration / 60)}:
                              {String(Math.floor(song.duration % 60)).padStart(
                                 2,
                                 '0'
                              )}
                           </div>

                           {/* Delete Button */}
                           <button
                              className='ml-4 text-red-500'
                              onClick={() => handleDeleteSong(song)}
                           >
                              ⊗
                           </button>
                           <div className='absolute top-0 left-0 w-full h-full opacity-50'></div>
                        </li>
                        {dragInsertPosition === index && (
                           <div className="w-full my-2 h-6 py-2 mb-4">
                            <div className="h-6 bg-gray-300 opacity-30 rounded-md"></div>
                          </div>
                       )}
                     </React.Fragment>
                  ))}

                  {/* Handle placeholder for the end of the list */}
                  {songs && (dragInsertPosition === songs.length) && (
                     <div className="h-1 w-full p-1">
                        <div className="border-t-2 border-dashed border-gray-400 my-2">&nbsp;</div>
                    </div>
                  )}
               </ul>
            </div>
         </div>
      </div>
   )
}

PlaylistDetails.propTypes = {
   playlist: PropTypes.object.isRequired,
   playlists: PropTypes.array.isRequired,
   setPlaylists: PropTypes.func.isRequired,
   songs: PropTypes.array.isRequired,
   repeats: PropTypes.array.isRequired,
   selectedSong: PropTypes.object,
   setSelectedSong: PropTypes.func.isRequired,
   setSongs: PropTypes.func.isRequired,
   songRefs: PropTypes.object.isRequired,
   setSteps: PropTypes.func.isRequired,
   setSelectedPlaylists: PropTypes.func.isRequired,
}

export default PlaylistDetails
