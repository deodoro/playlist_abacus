import React from 'react'
import SongList from './SongList'
import PropTypes from 'prop-types'

const SongsSection = ({
    songs,
    selectedSong,
    selectSong,
    repeats,
    songRefs,
}) => {
    return (
        <div className="flex-1 overflow-auto relative">
            {/* Sticky Header */}
            <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-between sticky top-0 bg-gray-100 z-10 py-2">
                <span>Songs</span>
                <span className="text-sm text-gray-600">
                    {songs.length} songs
                </span>
                <span className="text-sm text-red-500">
                    {repeats.length} repeated
                </span>
            </h3>

            {/* Scrollable Song List */}
            <SongList
                songs={songs}
                selectedSong={selectedSong}
                selectSong={selectSong}
                repeats={repeats}
                songRefs={songRefs}
            />
        </div>
    )
}

SongsSection.propTypes = {
    songs: PropTypes.array.isRequired,
    selectedSong: PropTypes.object,
    selectSong: PropTypes.func.isRequired,
    repeats: PropTypes.array.isRequired,
    songRefs: PropTypes.object.isRequired,
}

export default SongsSection
