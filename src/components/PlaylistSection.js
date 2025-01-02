import React from "react";
import PlaylistList from "./PlaylistList";
import PropTypes from "prop-types";

const PlaylistSection = ({ playlists, selectedPlaylists, togglePlaylistSelection, deselectAllPlaylists }) => {
  return (
    <div className="flex-1 overflow-auto relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-100 pb-2 h-10 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Playlists</h3>
          <button
            className={`px-4 py-2 rounded-md text-xs font-medium ${
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
      </div>

      {/* Scrollable Playlist List */}
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
  className: PropTypes.string,
};

export default PlaylistSection;
