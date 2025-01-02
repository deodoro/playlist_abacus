import React from "react";
import PlaylistList from "./PlaylistList";
import PropTypes from "prop-types";

const PlaylistSection = ({ playlists, selectedPlaylists, togglePlaylistSelection, deselectAllPlaylists }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Playlists</h3>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            selectedPlaylists.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          onClick={deselectAllPlaylists}
          disabled={selectedPlaylists.length === 0}
        >
          Deselect All
        </button>
      </div>
      <PlaylistList
        playlists={playlists}
        selectedPlaylists={selectedPlaylists}
        togglePlaylistSelection={togglePlaylistSelection}
      />
    </div>
  );
};

PlaylistSection.propTypes = {
  playlists: PropTypes.array.isRequired,
  selectedPlaylists: PropTypes.array.isRequired,
  togglePlaylistSelection: PropTypes.func.isRequired,
  deselectAllPlaylists: PropTypes.func.isRequired,
};

export default PlaylistSection;
