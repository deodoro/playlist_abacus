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
    const [length, setLength] = useState(0)
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
                    if (origPlaylistId !== 'master') {
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

        try {
            const newPlaylist = { id: `${Date.now()}`, name: newPlaylistName }
            setPlaylists((prevPlaylists) => [...prevPlaylists, newPlaylist])
            setSongs((prevSongs) => {
                prevSongs[newPlaylist.id] = songs.map((song, index) => ({
                    ...song,
                    index,
                }))
                return prevSongs
            })

            setSteps((prevSteps) => [
                ...prevSteps,
                {
                    op: Operations.OP_NEW_PLAYLIST,
                    playlist: newPlaylist,
                    uris: songs.map((song) => song.uri),
                },
            ])
        } catch (error) {
            console.error('Error cloning playlist:', error.message)
        }
    }

    const handleDelete = (playlistId, song) => {
        setSongs((prevSongs) => {
            const updatedSongs = { ...prevSongs }
            const filteredSongs = updatedSongs[playlistId]?.filter(
                (s) => s.uri !== song.uri
            )
            updatedSongs[playlistId] = filteredSongs.map((s, index) => ({
                ...s,
                index,
            }))
            return updatedSongs // Return the updated state
        })

        setSteps((prevSteps) => [
            ...prevSteps,
            {
                op: Operations.OP_REMOVE,
                playlistId,
                song,
                index: song.index,
            },
        ])
    }

    const handleDeleteList = async () => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this playlist?'
        )
        if (confirmDelete) {
            try {
                setSteps((prevSteps) => [
                    ...prevSteps,
                    {
                        op: Operations.OP_DELETE_PLAYLIST,
                        playlistId: playlist.id,
                    },
                ])
                setSongs((prevSongs) => {
                    delete prevSongs[playlist.id]
                    return prevSongs
                })
                setPlaylists((prevPlaylists) => {
                    return prevPlaylists.filter((p) => p.id !== playlist.id)
                })
                setSelectedPlaylists((prevSelectedPlaylists) =>
                    prevSelectedPlaylists.filter((p) => p.id !== playlist.id)
                )
            } catch (error) {
                console.error('Error deleting playlist:', error.message)
                alert('An error occurred while deleting the playlist.')
            }
        }
    }

    useEffect(() => {
        if (songs)
            setLength(
                Math.round(
                    songs
                        .map((i) => i.duration)
                        .reduce((acc, d) => acc + d, 0) / 36
                ) / 100
            )
        else setLength(0)
    }, [songs])

    return (
        <div
            className='playlist-details'
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <h3>
                {playlist.name}
                <span className='info count'>{songs?.length || 0} songs</span>
                <span className='info duration'>{length} hours</span>
                <a href='#' className='clone-button' onClick={cloneList}>
                    clone
                </a>
                <a
                    href='#'
                    className='delete-button'
                    onClick={handleDeleteList}
                >
                    delete
                </a>
            </h3>
            <ul className='song-details'>
                {songs?.map((song, index) => (
                    <li
                        key={index}
                        className={`song-detail-item ${
                            repeats.some((r) => r.uri === song.uri)
                                ? 'repeat'
                                : ''
                        } ${
                            selectedSong?.name === song.name &&
                            selectedSong?.artist === song.artist
                                ? 'selected'
                                : ''
                        }`}
                        draggable
                        ref={(el) => {
                            if (!songRefs.current[song.uri]) {
                                songRefs.current[song.uri] = []
                            }
                            songRefs.current[song.uri].push(el)
                        }}
                        onDragStart={(e) => handleDragStart(e, song)}
                        onClick={() => setSelectedSong(song)}
                        data-index={index}
                    >
                        <div className='song-index'> {song.index + 1} </div>
                        <div className='song-name'> {song.name} </div>
                        <div className='song-artist'> {song.artist} </div>
                        <div className='song-duration'>
                            {Math.floor(song.duration / 60)}:
                            {String(Math.floor(song.duration % 60)).padStart(
                                2,
                                '0'
                            )}
                        </div>
                        <div
                            className='delete-icon'
                            onClick={() => handleDelete(playlist.id, song)}
                        >
                            ⊗
                        </div>
                    </li>
                ))}
            </ul>
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
