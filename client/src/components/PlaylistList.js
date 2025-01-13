import React from "react";
import PropTypes from "prop-types";

const PlaylistList = ({ playlists, selectedPlaylists, togglePlaylistSelection }) => (
  <ul className="px-2">
    {playlists
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((playlist) => (
        <li
          key={playlist.id}
          onClick={() => togglePlaylistSelection(playlist)}
          className={`cursor-pointer p-2 ${
            selectedPlaylists.some((p) => p.id === playlist.id)
              ? "bg-blue-500 text-white"
              : "text-gray-800 hover:bg-gray-100"
          }`}
        >
          {playlist.name} <span className='text-xs text-gray-400'>({playlist.track_count} tracks)</span>
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
