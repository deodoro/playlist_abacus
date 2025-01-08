import React from 'react'
import PropTypes from 'prop-types'

const SongDetailItem = ({
   song,
   index,
   selectedSong,
   repeats,
   songRefs,
   handleDragStart,
   setSelectedSong,
   handlePlaySong,
   handleDeleteSong,
}) => {
   return (
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
            if (!songRefs.current[song.uri]) songRefs.current[song.uri] = []
            songRefs.current[song.uri].push(el)
         }}
         onDragStart={(e) => {
            handleDragStart(e, song)
         }}
         onClick={() => setSelectedSong(song)}
         onDoubleClick={() => handlePlaySong(song)}
         data-index={index}
      >
         {song.playing && (
            <div className='absolute inset-0 bg-yellow-500 opacity-10 pointer-events-none'></div>
         )}
         {/* Song Index and Name */}
         <div className='flex-1 break-words z-10 pointer-events-none'>
            {song.index + 1}. {song.name}
         </div>

         {/* Song Artist */}
         <div className='flex-1 break-words z-10 pointer-events-none'>
            {song.artist}
         </div>

         {/* Song Duration */}
         <div className='w-16 text-sm text-right z-10 pointer-events-none'>
            {Math.floor(song.duration / 60)}:
            {String(Math.floor(song.duration % 60)).padStart(2, '0')}
         </div>

         {/* Delete Button */}
         <button
            className='ml-4 text-red-500 z-10'
            onClick={(e) => {
               e.stopPropagation() // Prevent triggering setSelectedSong
               handleDeleteSong(song)
            }}
         >
            ⊗
         </button>
         <div className='absolute top-0 left-0 w-full h-full opacity-50 z-0'></div>
      </li>
   )
}

SongDetailItem.propTypes = {
   song: PropTypes.object.isRequired,
   index: PropTypes.number.isRequired,
   selectedSong: PropTypes.object,
   repeats: PropTypes.array.isRequired,
   songRefs: PropTypes.object.isRequired,
   handleDragStart: PropTypes.func.isRequired,
   setSelectedSong: PropTypes.func.isRequired,
   handlePlaySong: PropTypes.func.isRequired,
   handleDeleteSong: PropTypes.func.isRequired,
}

export default SongDetailItem
