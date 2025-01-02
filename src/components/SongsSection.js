import React from 'react'
import SongList from './SongList'
import PropTypes from 'prop-types'

const SongsSection = ({
    songs,
    selectedSong,
    selectSong,
    repeats,
    songRefs,
    className,
}) => {
    return (
        <div className={className}>
            <h3 className='text-lg font-semibold text-gray-800 flex items-center justify-between'>
                Songs
                <span className='text-sm text-gray-600'>
                    {songs.length} songs
                </span>
                <span className='text-sm text-red-500'>
                    {repeats.length} repeated
                </span>
            </h3>
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
    className: PropTypes.string,
}

export default SongsSection
