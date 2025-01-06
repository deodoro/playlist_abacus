import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { deduplicate } from '../utils/helpers'
import Operations from '../utils/operations'

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

    const handleExecute = () => {
        if (!actionPlaylistName || !selectedAction) return

        const newPlaylist = { id: `${Date.now()}`, name: actionPlaylistName }
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
            const updatedSongs = { ...prev }
            updatedSongs[newPlaylist.id] = affectedSongs
            return updatedSongs
        })
        setSteps((prev) => [
            ...prev,
            {
                op: Operations.OP_NEW_PLAYLIST,
                playlist: newPlaylist,
                uris: affectedSongs.map((song) => song.uri),
                tId: String(Date.now()),
            },
        ])
        setActionPlaylistName('')
        setSelectedAction(null) // Reset selected action after execution
    }

    return (
        <div className='bg-gray-100 p-4 rounded-md shadow-md h-[50vh] overflow-hidden'>
            <h3 className='text-lg font-semibold mb-2'>Actions</h3>
            <div className='mb-4 text-gray-400'>You can create a new playlist by performing one of following operations:</div>
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
                        <span className='mr-2'>✓</span>
                    )}
                    Merge
                </button>
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
                        <span className='mr-2'>✓</span>
                    )}
                    Intersect
                </button>
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
                        <span className='mr-2'>✓</span>
                    )}
                    Subtract
                </button>
            </div>
            <input
                type='text'
                className='w-full mb-2 p-2 border rounded text-gray-800'
                placeholder='New Playlist Name'
                value={actionPlaylistName}
                onChange={(e) => setActionPlaylistName(e.target.value)}
            />
            <button
                className={`w-full p-2 rounded ${
                    actionPlaylistName && selectedAction
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handleExecute}
                disabled={!actionPlaylistName || !selectedAction}
            >
                Execute
            </button>
        </div>
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
