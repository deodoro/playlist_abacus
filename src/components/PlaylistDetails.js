import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Operations from '../utils/operations'

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
    const [length, setLength] = useState("0:00")

    useEffect(() => {
        if (songs){
            const hours =  songs.reduce((acc, { duration }) => acc + duration, 0);
            console.log(hours);
            setLength(`${Math.floor(hours / 3600)}:${String(Math.floor(hours/60) % 60).padStart(2, '0')}`);
        }
        else
            setLength("0:00")
    }, [songs])

    const handleDragStart = (e, song) => {
        e.dataTransfer.setData('song', JSON.stringify(song))
        e.dataTransfer.setData('playlist', playlist.id)
    }

    const handleDrop = (e) => {
        let firstRun = true
        const song = JSON.parse(e.dataTransfer.getData('song'))
        const origPlaylistId = e.dataTransfer.getData('playlist')
        const targetSongIndex =
            e.target.closest('.song-detail-item')?.dataset.index // Get the index of the target item

        setSongs((prevSongs) => {
            const updatedSongs = {
                ...prevSongs,
            }
            if (firstRun) {
                // TODO: Fix nested setSteps, which in StrictMode causes setters to run twice
                firstRun = false
                if (
                    origPlaylistId === 'master' ||
                    playlist.id != origPlaylistId
                ) {
                    const targetIndex =
                        targetSongIndex !== undefined
                            ? parseInt(targetSongIndex, 10)
                            : updatedSongs[playlist.id].length
                    const sourceIndex = song.index
                    updatedSongs[playlist.id].splice(targetIndex, 0, song) // Insert at the correct position
                    for (
                        let i = targetIndex;
                        i < updatedSongs[playlist.id].length;
                        i++
                    ) {
                        updatedSongs[playlist.id][i].index = i
                    }
                    setSteps((prevSteps) => [
                        ...prevSteps,
                        {
                            op: Operations.OP_INSERT,
                            playlistId: playlist.id,
                            song,
                            index: targetIndex,
                        },
                    ])
                    console.log(event.shiftKey);
                    if (origPlaylistId !== 'master' && event.shiftKey) {
                        updatedSongs[origPlaylistId].splice(sourceIndex, 1)
                        for (
                            let i = sourceIndex;
                            i < updatedSongs[origPlaylistId].length;
                            i++
                        ) {
                            updatedSongs[origPlaylistId][i].index = i
                        }
                        setSteps((prevSteps) => [
                            ...prevSteps,
                            {
                                op: Operations.OP_REMOVE,
                                playlistId: playlist.id,
                                song,
                                index: sourceIndex,
                            },
                        ])
                    }
                } else {
                    const targetIndex =
                        targetSongIndex !== undefined
                            ? parseInt(targetSongIndex, 10)
                            : updatedSongs[playlist.id].length - 1
                    console.log(targetIndex, targetSongIndex);
                    const newIndex =
                        targetIndex < song.index ? targetIndex : targetIndex + 1
                    const sourceIndex = song.index
                    updatedSongs[playlist.id].splice(sourceIndex, 1) // Remove the item from the source
                    updatedSongs[playlist.id].splice(newIndex - 1, 0, song) // Insert at the correct position
                    for (
                        let i = Math.max(
                            0,
                            Math.min(sourceIndex, targetIndex) - 1
                        );
                        i < updatedSongs[playlist.id].length;
                        i++
                    ) {
                        updatedSongs[playlist.id][i].index = i
                    }
                    setSteps((prevSteps) => [
                        ...prevSteps,
                        {
                            op: Operations.OP_MOVE,
                            playlistId: playlist.id,
                            song,
                            fromIndex: sourceIndex,
                            toIndex: targetIndex,
                        },
                    ])
                }
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
            },
        ])
    }

    const handleDeleteList = () => {
        if (!window.confirm('Are you sure you want to delete this playlist?'))
            return

        setSteps((prev) => [
            ...prev,
            { op: Operations.OP_DELETE_PLAYLIST, playlistId: playlist.id },
        ])
        setPlaylists((prev) => prev.filter((p) => p.id !== playlist.id))
        setSongs((prev) => {
            const { [playlist.id]: _, ...rest } = prev
            return rest
        })
        setSelectedPlaylists((prev) => prev.filter((p) => p.id !== playlist.id))
    }

    const handleDeselect = () => {
        setSelectedPlaylists((prev) => prev.filter((p) => p.id !== playlist.id))
    }

    return (
        <div
            className='bg-gray-100 p-4 rounded-md shadow-md h-[50vh] pt-0'
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
        <div className="flex flex-col h-full">
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
                        <li
                            key={index}
                            className={`song-detail-item text-gray-600 flex items-center p-2 rounded-md ${
                                selectedSong?.uri === song.uri
                                    ? 'bg-blue-500 text-white'
                                    : (repeats.some((r) => r.uri === song.uri) ? 'text-orange-300 font-[400]' : '')
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
                                onClick={(e) => {
                                    e.stopPropagation()
                                    // Implement delete song logic
                                }}
                            >
                                ⊗
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            </div>
        </div>
    )
}

PlaylistDetails.propTypes = {
    playlist: PropTypes.object.isRequired,
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
