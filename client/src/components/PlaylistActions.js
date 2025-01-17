import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { deduplicate } from '../utils/helpers'
import Operations from '../utils/operations'
import { createCustomPlaylist } from '../utils/api'
import Spinner from './Spinner'

const PlaylistActions = ({
   selectedPlaylists,
   setPlaylists,
   songs,
   setSongs,
   actionPlaylistName,
   setActionPlaylistName,
   repeats,
   setSteps,
}) => {
   const [selectedAction, setSelectedAction] = useState(null)
   const [length, setLength] = useState(1)
   const [lengthUnit, setLengthUnit] = useState('hours')
   const [includeFavorites, setIncludeFavorites] = useState(true)
   const [customInstructions, setCustomInstructions] = useState([
      'The playlist should try to follow the mood and type of artists of the seed playlists.',
      'The playlists should not repeat songs from existing playlists.',
   ])
   const [loading, setLoading] = useState(false);

   const handleExecute = () => {
      if (!actionPlaylistName || !selectedAction) return

      const newPlaylist = {
         id: `${Date.now()}`,
         name: actionPlaylistName,
      }
      let affectedSongs = []

      switch (selectedAction) {
         case 'merge':
            affectedSongs = deduplicate(
               selectedPlaylists.flatMap((p) => songs[p.id] || [])
            )
            break
         case 'intersect':
            affectedSongs = repeats
            break
         case 'diff':
            affectedSongs = deduplicate(
               selectedPlaylists.reduce((acc, p, idx) => {
                  const songsList = songs[p.id] || []
                  return idx === 0
                     ? songsList
                     : acc.filter(
                          (song) =>
                             !songsList.some(
                                (s) =>
                                   s.name === song.name &&
                                   s.artist === song.artist
                             )
                       )
               }, [])
            )
            break
      }

      setPlaylists((prev) => [...prev, newPlaylist])
      setSongs((prev) => {
         const updatedSongs = {
            ...prev,
         }
         updatedSongs[newPlaylist.id] = affectedSongs.sort(
            (a, b) => a.index - b.index
         )
         return updatedSongs
      })
      setSteps((prev) => [
         ...prev,
         {
            op: Operations.OP_NEW_PLAYLIST,
            playlist: newPlaylist,
            uris: affectedSongs
               .sort((a, b) => a.index - b.index)
               .map((song) => song.uri),
            tId: String(Date.now()),
         },
      ])
      setActionPlaylistName('')
      setSelectedAction(null)
   }

   const handleExecuteAI = async () => {
      const samplePlaylists = selectedPlaylists.map((p) => {
          console.log(songs[p.id])
          return (songs[p.id] || []).map((song) => ({
             name: song.name,
             artist: song.artist,
          }))
      }
      )
      const favoriteSongs = songs['FAVORITES'] || []
      const favorites = includeFavorites
         ? favoriteSongs.map((song) => ({
              name: song.name,
              artist: song.artist,
           }))
         : []

      try {
        setLoading(true);
         const result = await createCustomPlaylist(
            samplePlaylists,
            customInstructions,
            length,
            lengthUnit,
            favorites
         )
         console.log('Generated playlist:', result)
      } catch (error) {
         console.error('Failed to generate playlist:', error.message)
      }
      finally {
        setLoading(false);
      }
   }

   return (
    <>
        {loading && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                <Spinner /> {/* Spinner component */}
            </div>
        )}
      <div className='bg-gray-100 p-4 h-full overflow-hidden flex flex-col'>
         <div className='flex-1 h-1/2'>
         <h3 className='text-lg font-semibold mb-2'> Playlist operations </h3>{' '}
            <div className='mb-4 text-gray-400'>
               You can create a new playlist by performing one of the following
               operations:
            </div>{' '}
            <div className='mb-4'>
               <button
                  className={`w-full p-2 rounded mb-2 flex items-center ${
                      selectedAction === 'merge'
                      ? 'bg-blue-900 text-white center'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                    onClick={() => setSelectedAction('merge')}
                    disabled={selectedPlaylists.length < 2}
                    >
                  {selectedAction === 'merge' && (
                     <span className='mr-2'> ✓ </span>
                     )}
                  Merge{' '}
               </button>{' '}
               <button
                  className={`w-full p-2 rounded mb-2 flex items-center ${
                     selectedAction === 'intersect'
                        ? 'bg-yellow-900 text-white'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                  onClick={() => setSelectedAction('intersect')}
                  disabled={!repeats || repeats.length === 0}
                  >
                  {selectedAction === 'intersect' && (
                      <span className='mr-2'> ✓ </span>
                      )}
                  Intersect{' '}
               </button>{' '}
               <button
                  className={`w-full p-2 rounded flex items-center ${
                      selectedAction === 'diff'
                      ? 'bg-red-900 text-white'
                      : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                    onClick={() => setSelectedAction('diff')}
                    disabled={selectedPlaylists.length < 2}
                    >
                  {selectedAction === 'diff' && (
                     <span className='mr-2'> ✓ </span>
                     )}
                  Subtract{' '}
               </button>{' '}
            </div>{' '}
            <input
               type='text'
               className='w-full mb-2 p-2 border rounded text-gray-800'
               placeholder='New Playlist Name'
               value={actionPlaylistName}
               onChange={(e) => setActionPlaylistName(e.target.value)}
            />{' '}
            <button
               className={`w-full p-2 rounded ${
                  actionPlaylistName && selectedAction
                     ? 'bg-green-500 text-white hover:bg-green-600'
                     : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
               onClick={handleExecute}
               disabled={!actionPlaylistName || !selectedAction}
            >
               Execute{' '}
            </button>{' '}
         </div>{' '}
         <div className='border-t-2 flex-1 h-[1/2] pt-4'>
         <h3 className='text-lg font-semibold mb-2'> AI assistance </h3>{' '}
            <div className='mb-4 text-gray-400'>
               Or you can produce it by letting ChatGPT examine the selected playlists
               and your favorites.{' '}
            </div>{' '}
            <div className='mb-2'>
                <div className='flex flex-row'>
               <input
                  type='number'
                  className='w-full mb-2 p-2 border rounded text-gray-800'
                  placeholder='Length'
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  />{' '}
               <select
                  className='w-full mb-2 p-2 border rounded text-gray-800'
                  value={lengthUnit}
                  onChange={(e) => setLengthUnit(e.target.value)}
                  >
                  <option value='hours'> Hours </option>{' '}
                  <option value='minutes'> Minutes </option>{' '}
                  <option value='songs'> Songs </option>{' '}
               </select>{' '}
                   </div>
               <label className='flex items-center mb-4'>
                  <input
                     type='checkbox'
                     className='mr-2'
                     checked={includeFavorites}
                     onChange={(e) => setIncludeFavorites(e.target.checked)}
                     />
                  Include favorite songs{' '}
               </label>{' '}
               <label className='text-gray-400'>Custom instructions</label>
               <textarea
                  className='w-full mb-2 p-2 border rounded text-gray-800'
                  rows='3'
                  placeholder='Add custom instructions'
                  value={customInstructions.join('\n')}
                  onChange={(e) =>
                    setCustomInstructions(e.target.value.split('\n'))
                }
                ></textarea>{' '}
            </div>{' '}
            <input
               type='text'
               className='w-full mb-2 p-2 border rounded text-gray-800'
               placeholder='New Playlist Name'
               value={actionPlaylistName}
               onChange={(e) => setActionPlaylistName(e.target.value)}
            />{' '}
            <button
               className={`w-full p-2 rounded ${
                   actionPlaylistName
                     ? 'bg-green-500 text-white hover:bg-green-600'
                     : 'bg-gray-300 text-gray-500 cursor-not-allowed'
               }`}
               onClick={handleExecuteAI}
               disabled={!actionPlaylistName}
            >
               Execute{' '}
            </button>{' '}
         </div>{' '}
      </div>
</>
   )
}

PlaylistActions.propTypes = {
    selectedPlaylists: PropTypes.array.isRequired,
   playlists: PropTypes.array.isRequired,
   setPlaylists: PropTypes.func.isRequired,
   setSongs: PropTypes.func.isRequired,
   actionPlaylistName: PropTypes.string.isRequired,
   setActionPlaylistName: PropTypes.func.isRequired,
   repeats: PropTypes.array.isRequired,
   setSteps: PropTypes.func.isRequired,
   songs: PropTypes.object.isRequired,
}

export default PlaylistActions
