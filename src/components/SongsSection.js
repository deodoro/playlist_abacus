import React from "react";
import SongList from "./SongList";
import PropTypes from "prop-types";

const SongsSection = ({ songs, selectedSong, selectSong, repeats }) => {
  return (
    <div className="songs">
      <h3>Songs</h3>
      <SongList
        songs={songs}
        selectedSong={selectedSong}
        selectSong={selectSong}
        repeats={repeats}
      />
    </div>
  );
};

SongsSection.propTypes = {
    songs: PropTypes.array.isRequired,
    selectedSong: PropTypes.object,
    selectSong: PropTypes.func.isRequired,
    repeats: PropTypes.array.isRequired,
};

export default SongsSection;
