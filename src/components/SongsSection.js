import React from "react";
import SongList from "./SongList";
import PropTypes from "prop-types";

const SongsSection = ({ songs, selectedSong, selectSong, repeats, songRefs }) => {
  return (
    <div className="songs">
      <h3>Songs
        <span className="song-count info">
          {songs.length} songs
        </span>
        <span className="repeat-count info">
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
  );
};

SongsSection.propTypes = {
    songs: PropTypes.array.isRequired,
    selectedSong: PropTypes.object,
    selectSong: PropTypes.func.isRequired,
    repeats: PropTypes.array.isRequired,
    songRefs: PropTypes.object.isRequired,
};

export default SongsSection;
