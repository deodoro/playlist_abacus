import React from "react";
import PlaylistList from "./PlaylistList";
import PropTypes from "prop-types";

const PlaylistSection = ({ playlists, selectedPlaylists, togglePlaylistSelection, deselectAllPlaylists }) => {
  return (
    <div className="playlists">
      <div className="playlists-header">
        <h3>
          <span>Playlists</span>
          <button
            className="deselect-all"
            onClick={deselectAllPlaylists}
            disabled={selectedPlaylists.length === 0}
          >
            Deselect All
          </button>
        </h3>
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
