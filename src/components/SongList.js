import React from "react";
import PropTypes from "prop-types";

const SongList = ({ songs, selectedSong, selectSong, repeats }) => (
  <ul className="song-list">
    {songs.map((song, index) => (
      <li
        key={index}
        className={`song-item ${
          repeats.some((r) => r.name === song.name && r.artist === song.artist)
            ? "repeat"
            : ""
        } ${
          selectedSong?.name === song.name && selectedSong?.artist === song.artist
            ? "selected"
            : ""
        }`}
        onClick={() => selectSong(song)}
      >
        <div className="song-name">{song.name}</div>
        <div className="song-artist">{song.artist}</div>
        <div className="song-duration">
          {Math.floor(song.duration / 60)}:
          {Math.floor(song.duration % 60).toString().padStart(2, "0")}
        </div>
      </li>
    ))}
  </ul>
);

SongList.propTypes = {
    songs: PropTypes.array.isRequired,
    selectedSong: PropTypes.object,
    selectSong: PropTypes.func.isRequired,
    repeats: PropTypes.array.isRequired,
}

export default SongList;
