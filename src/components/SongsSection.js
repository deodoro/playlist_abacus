import React, { useState } from 'react'
import SongList from './SongList'
import PropTypes from 'prop-types'
import { FaFilter } from 'react-icons/fa' // Import filter icon from react-icons

const SongsSection = ({
   songs,
   selectedSong,
   selectSong,
   repeats,
   songRefs,
   setSongs,
}) => {
   const [isFiltering, setIsFiltering] = useState(false) // Track filter state

   // Handle toggle filter click
   const toggleFilter = () => {
      setIsFiltering((prev) => !prev) // Toggle filter state
   }

   // Filter songs if filtering is active
   const displayedSongs = isFiltering
      ? songs.filter((s) => repeats.some((i) => i.uri === s.uri))
      : songs

   return (
      <div className='flex flex-col h-full'>
         {/* Sticky Header */}
         <div className='sticky top-0 z-10 bg-gray-400 text-white py-2 px-4'>
            <h3 className='text-lg font-semibold flex items-center justify-between'>
               <span>Songs</span>
               <span className='text-sm text-gray-300'>
                  {songs.length} songs
               </span>

               {/* Repeated Section with Tooltip */}
               <span
                  className='text-sm text-orange-200 flex items-center gap-2 cursor-pointer hover:underline'
                  onClick={toggleFilter}
                  title='Click to filter to repeated songs only'
               >
                  {<FaFilter className={isFiltering ? 'opacity-100' : 'opacity-20'} />}{' '}
                  {repeats.length} repeated
               </span>
            </h3>
         </div>

         {/* Scrollable Song List */}
         <div className='flex-1 overflow-y-auto'>
            <SongList
               songs={displayedSongs} // Pass filtered or all songs
               selectedSong={selectedSong}
               selectSong={selectSong}
               repeats={repeats}
               songRefs={songRefs}
               setSongs={setSongs}
            />
         </div>
      </div>
   )
}

SongsSection.propTypes = {
   songs: PropTypes.array.isRequired,
   selectedSong: PropTypes.object,
   selectSong: PropTypes.func.isRequired,
   repeats: PropTypes.array.isRequired,
   songRefs: PropTypes.object.isRequired,
   setSongs: PropTypes.func.isRequired,
}

export default SongsSection
