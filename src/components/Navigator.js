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
} from '../utils/api'
import Operations from '../utils/operations'
import SavePanel from './SavePanel'

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
   const songRefs = useRef({})
   const [newPlaylistName, setNewPlaylistName] = useState('')

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
            case Operations.OP_INSERT: {
               const { song, playlistId, index } = step
               console.log(`ADD ${song.uri} to ${playlistId} at ${index}`)
               await addSongsToPlaylist(playlistId, [song.uri])
               if (songs[playlistId].length > 1)
                  await moveTrackInPlaylist(
                     playlistId,
                     songs[playlistId].length - 1,
                     index + 1
                  )
               break
            }
            case Operations.OP_REMOVE: {
               const { song, playlistId } = step
               console.log(`DELETE ${song.uri} from ${playlistId}`)
               await removeSongFromPlaylist(playlistId, song.uri)
               break
            }
            case Operations.OP_MOVE: {
               const { song, playlistId, fromIndex, toIndex } = step
               console.log(
                  `MOVE ${song.uri} in ${playlistId} from ${fromIndex} to ${toIndex}`
               )
               await moveTrackInPlaylist(playlistId, fromIndex, toIndex)
               break
            }
            case Operations.OP_DELETE_PLAYLIST: {
               console.log(`DELETE LIST ${step.playlist.id}`)
               await deleteList(step.playlist.id)
               break
            }
            case Operations.OP_NEW_PLAYLIST: {
               const { playlist, uris } = step
               const newPlaylist = await createPlaylist(playlist.name)
               await addSongsToPlaylist(newPlaylist.id, uris)
               break
            }
         }
      }
      setSteps([])
   }

   const revertChanges = () => {
      setSteps([])
      setSelectedPlaylists([])
      setRepeats([])
      setSongs({})
      fetchPlaylists()
         .then((data) =>
            setPlaylists(
               data.items.map((playlist) => ({
                  id: playlist.id,
                  name: playlist.name,
               }))
            )
         )
         .catch(console.error)
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
         <div className='flex flex-col sticky top-0 bottom-0 h-screen w-1/4 bg-gray-100'>
            {/* FilterBox and PlaylistSection */}
            <div className='p-4 flex-1 overflow-auto relative'>
               {/* <FilterBox filterText={filterText} setFilterText={setFilterText} /> */}
               <PlaylistSection
                  playlists={filteredPlaylists}
                  selectedPlaylists={selectedPlaylists}
                  togglePlaylistSelection={togglePlaylistSelection}
                  deselectAllPlaylists={() => setSelectedPlaylists([])}
                  filterText={filterText}
                  setFilterText={setFilterText}
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
            className={`p-4 bg-gray-50 grid grid-cols-3 gap-4 gap-y-8 w-3/4 h-screen overflow-auto ${
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
