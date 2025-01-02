import React from "react";
import PropTypes from "prop-types";

const PlaylistList = ({ playlists, selectedPlaylists, togglePlaylistSelection }) => (
  <ul className="divide-y divide-gray-200">
    {playlists
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((playlist) => (
        <li
          key={playlist.id}
          onClick={() => togglePlaylistSelection(playlist)}
          className={`cursor-pointer p-2 rounded-md ${
            selectedPlaylists.some((p) => p.id === playlist.id)
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-800 hover:bg-gray-100"
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
