import React from "react";
import SongList from "./SongList";
import PropTypes from "prop-types";

const SongsSection = ({
  songs,
  selectedSong,
  selectSong,
  repeats,
  songRefs,
  setSongs,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-400 text-white py-2 px-4">
        <h3 className="text-lg font-semibold flex items-center justify-between">
          <span>Songs</span>
          <span className="text-sm text-gray-300">{songs.length} songs</span>
          <span className="text-sm text-orange-200">{repeats.length} repeated</span>
        </h3>
      </div>

      {/* Scrollable Song List */}
      <div className="flex-1 overflow-y-auto">
        <SongList
          songs={songs}
          selectedSong={selectedSong}
          selectSong={selectSong}
          repeats={repeats}
          songRefs={songRefs}
          setSongs={setSongs}
        />
      </div>
    </div>
  );
};

SongsSection.propTypes = {
  songs: PropTypes.array.isRequired,
  selectedSong: PropTypes.object,
  selectSong: PropTypes.func.isRequired,
  repeats: PropTypes.array.isRequired,
  songRefs: PropTypes.object.isRequired,
  setSongs: PropTypes.func.isRequired,
};

export default SongsSection;
