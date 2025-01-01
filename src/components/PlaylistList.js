import React from "react";
import PropTypes from "prop-types";

const PlaylistList = ({ playlists, selectedPlaylists, togglePlaylistSelection }) => (
  <ul className="playlist-list">
    {playlists.sort((a, b) => a.name.localeCompare(b.name)).map((playlist) => (
      <li
        key={playlist.id}
        onClick={() => togglePlaylistSelection(playlist)}
        className={`playlist-item ${
          selectedPlaylists.some((p) => p.id === playlist.id) ? "selected" : ""
        }`}
      >
        {playlist.name}
      </li>
    ))}
  </ul>
);

PlaylistList.propTypes = {
    playlists: PropTypes.array.isRequired,
    selectedPlaylists: PropTypes.array.isRequired,
    togglePlaylistSelection: PropTypes.func.isRequired,
};

export default PlaylistList;
