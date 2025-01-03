import React from "react";
import PlaylistList from "./PlaylistList";
import PropTypes from "prop-types";
import FilterBox from "./FilterBox";

const PlaylistSection = ({ playlists, selectedPlaylists, togglePlaylistSelection, deselectAllPlaylists, filterText, setFilterText }) => {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-gray-100">
          <FilterBox filterText={filterText} setFilterText={setFilterText} />
          <div className="sticky top-0 z-10 bg-gray-100 pb-2">
            <div className="flex items-center justify-between">
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
        </div>

        {/* Scrollable Playlist List */}
        <div className="flex-1 overflow-y-auto">
          <PlaylistList
            playlists={playlists}
            selectedPlaylists={selectedPlaylists}
            togglePlaylistSelection={togglePlaylistSelection}
          />
        </div>
      </div>
    );
  };


PlaylistSection.propTypes = {
  playlists: PropTypes.array.isRequired,
  selectedPlaylists: PropTypes.array.isRequired,
  togglePlaylistSelection: PropTypes.func.isRequired,
  deselectAllPlaylists: PropTypes.func.isRequired,
  filterText: PropTypes.string.isRequired,
  setFilterText: PropTypes.func.isRequired,
};

export default PlaylistSection;
