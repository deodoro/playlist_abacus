import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Operations from '../utils/operations'
import { playSong, getSongDetails } from '../utils/api'
import { useDevice } from '../context/DeviceContext'
import { createDragImage, updatePlayingStatus } from '../utils/helpers'
import SongDetailItem from './SongDetailItem'

const PlaylistDetails = ({
   playlist,
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
   const [_, setDragOver] = useState('')
   const [dragInsertPosition, setDragInsertPosition] = useState(null)
   const { activeDeviceId } = useDevice()

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
      const dragImage = createDragImage(song)
      e.dataTransfer.setData('song', JSON.stringify(song))
      e.dataTransfer.setData('playlist', playlist.id)
      e.dataTransfer.setDragImage(dragImage, 10, 10)

      // Clean up after drag ends
      e.target.addEventListener('dragend', () => {
         try {
            document.body.removeChild(dragImage)
         } catch (e) {
            console.error('Error removing drag image:', e)
         }
      })
   }

   const handleDrop = (e) => {
      const song = JSON.parse(e.dataTransfer.getData('song'))
      const sourceIndex = song.index
      const origPlaylistId = e.dataTransfer.getData('playlist')
      const targetSongIndex = e.target.closest('li')?.dataset.index
      const targetIndex =
         targetSongIndex !== undefined
            ? parseInt(targetSongIndex, 10)
            : songs[playlist.id]
            ? songs[playlist.id].length
            : -1
      const isMove = origPlaylistId !== 'master' && e.shiftKey
      const transactionId = String(Date.now())

      setDragOver('')
      setDragInsertPosition(null)
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
                  toIndex:
                     sourceIndex < targetIndex
                        ? targetIndex + 1
                        : targetIndex + 2,
                  tId: transactionId,
               },
            ]
         }
      })

      setSongs((prevSongs) => {
         const updatedSongs = { ...prevSongs }
         const updateIndexes = (list, start) => {
            const newItems = list.slice(start).map((i, index) => {
               return { ...i, index: start + index }
            })
            return list.slice(0, start).concat(newItems)
         }

         if (origPlaylistId === 'master' || playlist.id !== origPlaylistId) {
            const newIndex = targetIndex + 1
            updatedSongs[playlist.id].splice(newIndex, 0, song)
            updatedSongs[playlist.id] = updateIndexes(
               updatedSongs[playlist.id],
               newIndex
            )
            if (isMove) {
               updatedSongs[origPlaylistId].splice(sourceIndex, 1)
               updatedSongs[origPlaylistId] = updateIndexes(
                  updatedSongs[origPlaylistId],
                  sourceIndex
               )
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

   const handlePlaySong = (song) => {
      playSong(song.uri, activeDeviceId)
      setSongs((prev) => updatePlayingStatus(prev, song.uri))
   }

   const handleSaveList = () => {
      if (!songs || songs.length === 0) {
         alert('No songs to save.')
         return
      }

      const playlistData = {
         name: playlist.name,
         songs: songs.map((song) => song.uri),
      }

      const blob = new Blob([JSON.stringify(playlistData, null, 2)], {
         type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${playlist.name.replace(/\s+/g, '_')}_playlist.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
   }

   const handleLoadList = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const loadSongs = async () => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.songs || !Array.isArray(data.songs)) {
                    alert('Invalid playlist file format.');
                    return;
                }
                console.log("JSON loaded", data);

                // Use Promise.all to resolve all promises
                const newSongs = await Promise.all(
                    data.songs.map(async (uri, index) => {
                        const song = await getSongDetails(uri);
                        return { ...song, uri, index: index + songs.length };
                    })
                );

                const transactionId = String(Date.now())
                setSteps((prevSteps) => {
                    const newOps = newSongs.map((song) => ({
                       op: Operations.OP_INSERT_NO_REORDER,
                       playlistId: playlist.id,
                       song,
                       index: song.index,
                       tId: transactionId,
                    }))

                    return [...prevSteps, ...newOps]
                })

                setSongs((prev) => {
                    const updatedSongs = { ...prev };
                    updatedSongs[playlist.id] = [
                        ...updatedSongs[playlist.id],
                        ...newSongs
                    ];
                    return updatedSongs;
                });

            } catch (error) {
                alert('Failed to load playlist. Please ensure the file is valid.');
                console.error('Error loading playlist:', error);
            }
        };

        // Call the async function
        loadSongs();
    };

    reader.readAsText(file);
};


   return (
      <div className='overflow-hidden relative'>
         <div className='bg-gray-100 p-4 rounded-md shadow-md h-full pt-0'>
            <div className='flex flex-col h-full'>
               <div className=''>
                  <h3 className='sticky top-0 z-10 pt-6 bg-gray-100 text-lg font-semibold text-gray-800 flex items-center justify-between pb-2'>
                     {playlist.name}
                     <span className='text-xs text-gray-400'>
                        {songs?.length || 0} songs
                     </span>
                     <span className='text-xs text-gray-400'>
                        {length} hours
                     </span>
                     <div className=' grid grid-cols-3 gap-2 gap-y-0 text-xs'>
                        <input
                        id="file-input"
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleLoadList}
                        />
                        <div></div>
                        <button
                           className='text-grey-600 hover:underline'
                           onClick={handleSaveList}
                        >
                           Save
                        </button>
                        <button
                           className='text-purple-600 hover:underline'
                           onClick={() => document.getElementById('file-input').click()}
                        >
                           Load
                        </button>
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
                  <ul
                     className='divide-y divide-gray-200 h-full'
                     onDragOver={(e) => {
                        setDragInsertPosition(
                           parseInt(e.target.closest('li')?.dataset.index)
                        )
                        e.preventDefault()
                     }} // Allow drop anywhere on UL
                     onDragLeave={() => setDragInsertPosition(null)}
                     onDrop={handleDrop} // Handle drop at UL level
                  >
                     {songs?.map((song, index) => (
                        <React.Fragment key={index}>
                           <SongDetailItem
                              song={song}
                              index={index}
                              selectedSong={selectedSong}
                              repeats={repeats}
                              songRefs={songRefs}
                              handleDragStart={handleDragStart}
                              setSelectedSong={setSelectedSong}
                              handlePlaySong={handlePlaySong}
                              handleDeleteSong={handleDeleteSong}
                           />
                           {dragInsertPosition === index && (
                              <div className='w-full my-2 h-6 py-2 mb-4'>
                                 <div className='h-6 bg-gray-300 opacity-30 rounded-md'></div>
                              </div>
                           )}
                        </React.Fragment>
                     ))}

                     {/* Handle placeholder for the end of the list */}
                     {songs && dragInsertPosition === songs.length && (
                        <div className='h-1 w-full p-1'>
                           <div className='border-t-2 border-dashed border-gray-400 my-2'>
                              &nbsp;
                           </div>
                        </div>
                     )}
                  </ul>
               </div>
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
