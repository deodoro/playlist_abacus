import React, { useState, useEffect, useRef } from 'react'
import useNavigatorState from '../hooks/useNavigatorState'
import { deduplicate, findRepeats } from '../utils/helpers'
import PlaylistSection from './PlaylistSection'
import SongsSection from './SongsSection'
import PlaylistDetails from './PlaylistDetails'
import PlaylistActions from './PlaylistActions'
import {
   fetchPlaylists,
   createPlaylist,
   addSongsToPlaylist,
   deleteList,
   removeSongFromPlaylist,
   moveTrackInPlaylist,
   addToFavorites,
   removeFromFavorites,
   fetchFavoriteSongs
} from '../utils/api'
import Operations from '../utils/operations'
import SavePanel from './SavePanel'
import { useNavigate } from 'react-router-dom'

const Navigator = () => {
   const {
      playlists,
      setPlaylists,
      songs,
      setSongs,
      selectedPlaylists,
      setSelectedPlaylists,
      fetchPlaylistSongs,
      steps,
      setSteps,
   } = useNavigatorState()

   const [selectedSong, setSelectedSong] = useState(null)
   const [filterText, setFilterText] = useState('')
   const [repeats, setRepeats] = useState([])
   const [newPlaylistName, setNewPlaylistName] = useState('')
   const [progress, setProgress] = useState(null)
   const songRefs = useRef({})
   const navigate = useNavigate()

   useEffect(() => {
      if (selectedPlaylists.length > 0) {
         setRepeats(findRepeats(songs, selectedPlaylists))
      } else {
         setRepeats([])
      }
   }, [selectedPlaylists, songs])

   const togglePlaylistSelection = (playlist) => {
      if (selectedPlaylists.some((p) => p.id === playlist.id)) {
         setSelectedPlaylists(
            selectedPlaylists.filter((p) => p.id !== playlist.id)
         )
      } else {
         setSelectedPlaylists([...selectedPlaylists, playlist])
         if (!(playlist.id in songs)) fetchPlaylistSongs(playlist.id)
      }
   }

   const handleSelectAllPlaylists = () => {
      const total = playlists.reduce(
         (acc, playlist) => acc + playlist.track_count,
         0
      )
      let count = 0
      const callback = (t) => {
         count += t
         if (count < total) setProgress({ count: count, total: total })
         else {
            setTimeout(() => {
               setProgress(null)
            }, 1000)
         }
      }
      setSelectedPlaylists(playlists)
      playlists.forEach((playlist) => {
         if (!(playlist.id in songs))
            fetchPlaylistSongs(playlist.id).then(() => {
               if (callback) callback(playlist.track_count)
            })
         else if (callback) callback(playlist.track_count)
      })
   }

   const selectSong = (song) => {
      setSelectedSong(song)
      if (songRefs.current[song.uri]) {
         songRefs.current[song.uri].forEach((ref) => {
            if (ref) {
               ref.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
               })
            }
         })
      }
   }

   const allSongsFromSelectedPlaylists = deduplicate(
      selectedPlaylists.map((playlist) => songs[playlist.id] || []).flat()
   )

   const filteredSongs = allSongsFromSelectedPlaylists.filter(
      (song) =>
         song.name.toLowerCase().includes(filterText.toLowerCase()) ||
         song.artist.toLowerCase().includes(filterText.toLowerCase())
   )

   const filteredPlaylists = playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(filterText.toLowerCase())
   )

   const isDirty = () => steps.length > 0

   const applyChanges = async () => {
      for (const step of steps) {
         switch (step.op) {
            case Operations.OP_INSERT:
               try {
                  const { song, playlistId, index } = step
                  console.log(`ADD ${song.uri} to ${playlistId} at ${index}`)
                  if (playlistId === 'FAVORITES') {
                     // Handle adding to FAVORITES
                     await addToFavorites(song.uri)
                     console.log(`Added ${song.uri} to FAVORITES`)
                  } else {
                     await addSongsToPlaylist(playlistId, [song.uri])
                     if (songs[playlistId].length > 1)
                        await moveTrackInPlaylist(
                           playlistId,
                           songs[playlistId].length - 1,
                           index + 1
                        )
                  }
               } catch (err) {
                  if (err.name === 'UnauthorizedError') {
                     navigate('/')
                  } else {
                     console.log('Failed to add song:', err.message)
                  }
               }
               break
            case Operations.OP_INSERT_NO_REORDER:
               try {
                  const { song, playlistId, index } = step
                  console.log(`ADD ${song.uri} to ${playlistId} at ${index}`)
                  if (playlistId === 'FAVORITES') {
                     await addToFavorites(song.uri)
                     console.log(`Added ${song.uri} to FAVORITES`)
                  } else {
                     await addSongsToPlaylist(playlistId, [song.uri])
                  }
               } catch (err) {
                  if (err.name === 'UnauthorizedError') {
                     navigate('/')
                  } else {
                     console.log('Failed to add song:', err.message)
                  }
               }
               break
            case Operations.OP_REMOVE:
               try {
                  const { song, playlistId } = step
                  console.log(`DELETE ${song.uri} from ${playlistId}`)
                  if (playlistId === 'FAVORITES') {
                     // Handle removing from FAVORITES
                     await removeFromFavorites(song.uri)
                     console.log(`Removed ${song.uri} from FAVORITES`)
                  } else await removeSongFromPlaylist(playlistId, song.uri)
               } catch (err) {
                  if (err.name === 'UnauthorizedError') {
                     navigate('/')
                  } else {
                     console.log('Failed to remove song:', err.message)
                  }
               }
               break
            case Operations.OP_MOVE:
               try {
                  const { song, playlistId, fromIndex, toIndex } = step
                  console.log(
                     `MOVE ${song.uri} in ${playlistId} from ${fromIndex} to ${toIndex}`
                  )
                  if (playlistId != 'FAVORITES')
                     await moveTrackInPlaylist(playlistId, fromIndex, toIndex)
               } catch (err) {
                  if (err.name === 'UnauthorizedError') {
                     navigate('/')
                  } else {
                     console.log('Failed to move song:', err.message)
                  }
               }
               break
            case Operations.OP_DELETE_PLAYLIST:
               try {
                  console.log(`DELETE LIST ${step.playlist.id}`)
                  await deleteList(step.playlist.id)
               } catch (err) {
                  if (err.name === 'UnauthorizedError') {
                     navigate('/')
                  } else {
                     console.log('Failed to delete playlist:', err.message)
                  }
               }
               break
            case Operations.OP_NEW_PLAYLIST:
               try {
                  const { playlist, uris } = step
                  const newPlaylist = await createPlaylist(playlist.name)
                  if (uris.length > 0)
                     await addSongsToPlaylist(newPlaylist.id, uris)
               } catch (err) {
                  if (err.name === 'UnauthorizedError') {
                     navigate('/') // Redirect to home route on 401
                  } else {
                     console.log('Failed to create playlist:', err.message)
                  }
               }
               break
         }
      }
      setSteps([])
   }

   const revertChanges = () => {
      setSteps([])
      setSelectedPlaylists([])
      setRepeats([])
      setSongs({})
      const loadPlaylists = async () => {
        try {
            const data = await fetchPlaylists();
            const favoriteSongs = await fetchFavoriteSongs();

            const favoritePlaylist = {
                id: 'FAVORITES',
                name: 'Favorites',
                track_count: favoriteSongs.length,
            };

            setPlaylists([
                ...data.map((playlist) => ({
                    id: playlist.id,
                    name: playlist.name,
                    track_count: playlist.tracks.total,
                })),
                favoritePlaylist, // Append special playlist for favorites
            ]);
            setSongs((prev) => ({
                ...prev,
                FAVORITES: favoriteSongs.map((track, idx) => ({
                    name: track.name,
                    artist: track.artists.map((artist) => artist.name).join(', '),
                    duration: track.duration_ms / 1000,
                    uri: track.uri,
                    index: idx,
                    image: track.album.images?.[0]?.url || null,
                    favorite: true
                })),
            }));
        } catch (err) {
            if (err.name === 'UnauthorizedError') {
                navigate('/'); // Redirect on unauthorized
            } else {
                console.error('Failed to fetch playlists:', err);
            }
        }
    };

    loadPlaylists();
   }

   const undoLastChange = () => {
      if (steps.length > 0) {
         const tId = steps[steps.length - 1].tId
         const stepsToUndo = []

         // Collect steps for the current transaction
         for (let i = steps.length - 1; i >= 0 && steps[i].tId === tId; i--) {
            stepsToUndo.unshift(steps.pop())
         }

         setSongs((prevSongs) => {
            const updatedSongs = { ...prevSongs }

            stepsToUndo.forEach((step) => {
               switch (step.op) {
                  case Operations.OP_INSERT:
                     updatedSongs[step.playlistId].splice(step.index + 1, 1)
                     reindexSongs(updatedSongs[step.playlistId])
                     break

                  case Operations.OP_REMOVE:
                     updatedSongs[step.playlistId].splice(
                        step.index,
                        0,
                        step.song
                     )
                     reindexSongs(updatedSongs[step.playlistId])
                     break

                  case Operations.OP_MOVE:
                     {
                        const movedSongs = [...updatedSongs[step.playlistId]]
                        const [movedSong] = movedSongs.splice(
                           step.toIndex - 1,
                           1
                        )
                        movedSongs.splice(step.fromIndex, 0, movedSong)
                        reindexSongs(movedSongs)
                        updatedSongs[step.playlistId] = movedSongs
                     }
                     break

                  default:
                     break
               }
            })

            return updatedSongs
         })

         setPlaylists((prevPlaylists) => {
            let updatedPlaylists = [...prevPlaylists]

            stepsToUndo.forEach((step) => {
               switch (step.op) {
                  case Operations.OP_NEW_PLAYLIST:
                     updatedPlaylists = updatedPlaylists.filter(
                        (p) => p.id !== step.playlist.id
                     )
                     break

                  case Operations.OP_DELETE_PLAYLIST:
                     updatedPlaylists.push(step.playlist)
                     break

                  default:
                     break
               }
            })

            return updatedPlaylists
         })
      }
   }

   const reindexSongs = (playlistSongs) => {
      playlistSongs.forEach((song, index) => {
         song.index = index
      })
   }

   return (
      <div className='flex text-gray-700 text-sm leading-6'>
         {/* Left Panel */}
         <div className='flex flex-col sticky top-0 bottom-0 h-screen w-1/4 bg-gray-300'>
            {/* FilterBox and PlaylistSection */}
            <div className='p-4 flex-1 overflow-auto relative'>
               {/* <FilterBox filterText={filterText} setFilterText={setFilterText} /> */}
               <PlaylistSection
                  playlists={filteredPlaylists}
                  selectedPlaylists={selectedPlaylists}
                  togglePlaylistSelection={togglePlaylistSelection}
                  deselectAllPlaylists={() => setSelectedPlaylists([])}
                  selectAllPlaylists={handleSelectAllPlaylists}
                  filterText={filterText}
                  setFilterText={setFilterText}
                  setPlaylists={setPlaylists}
                  setSteps={setSteps}
                  LoadProgress={progress}
               />
            </div>

            {/* SongsSection */}
            <div className='flex-1 bg-gray-400 p-4 flex-1 overflow-auto relative'>
               <SongsSection
                  songs={filteredSongs}
                  selectedSong={selectedSong}
                  selectSong={selectSong}
                  repeats={repeats}
                  songRefs={songRefs}
                  setSongs={setSongs}
               />
            </div>

            {isDirty() && (
               <SavePanel
                  steps={steps}
                  applyChanges={applyChanges}
                  revertChanges={revertChanges}
                  undoLastChange={undoLastChange}
               />
            )}
         </div>

         {/* Right Panel */}
         <div
            className={`bg-gray-50 grid grid-cols-3 gap-0 gap-y-0 w-3/4 h-screen overflow-auto ${
               selectedPlaylists.length > 3
                  ? 'auto-rows-[50%]'
                  : 'auto-rows-[100%]'
            }`}
         >
            {selectedPlaylists.map((playlist) => (
               <PlaylistDetails
                  key={playlist.id}
                  playlist={playlist}
                  playlists={playlists}
                  setPlaylists={setPlaylists}
                  songs={songs[playlist.id]}
                  repeats={repeats}
                  selectedSong={selectedSong}
                  setSelectedSong={selectSong}
                  setSongs={setSongs}
                  songRefs={songRefs}
                  setSteps={setSteps}
                  setSelectedPlaylists={setSelectedPlaylists}
               />
            ))}
            <PlaylistActions
               selectedPlaylists={selectedPlaylists}
               playlists={playlists}
               setPlaylists={setPlaylists}
               setSongs={setSongs}
               songs={songs}
               setSteps={setSteps}
               repeats={repeats}
               actionPlaylistName={newPlaylistName}
               setActionPlaylistName={setNewPlaylistName}
               setSelectedPlaylists={setSelectedPlaylists}
            />
         </div>
      </div>
   )
}

export default Navigator
