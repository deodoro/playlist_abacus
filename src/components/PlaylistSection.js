import React, { useState, useEffect } from "react";
import PlaylistList from "./PlaylistList";
import PropTypes from "prop-types";
import FilterBox from "./FilterBox";
import UserDeviceSelector from "./UserDeviceSelector";
import { getUserProfile, getAvailableDevices } from "../utils/api";
import { useDevice } from "../context/DeviceContext";

const PlaylistSection = ({ playlists, selectedPlaylists, togglePlaylistSelection, deselectAllPlaylists, filterText, setFilterText }) => {
  const [isUserPopupVisible, setIsUserPopupVisible] = useState(false);
  const [user, setUser] = useState(null);
  const {activeDeviceId, setActiveDeviceId} = useDevice();

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);

        const deviceData = await getAvailableDevices();
        setActiveDeviceId(deviceData.activeDeviceId);
      } catch (error) {
        console.error("Failed to load user or devices:", error);
      }
    };

    loadData();
  }, []);

  const handleAvatarClick = () => {
    setIsUserPopupVisible((prev) => !prev); // Toggle popup visibility
  };

  const handleLogOff = () => {
    console.log("Log off clicked"); // Placeholder for log off action
  };

  const handleDeviceChange = (e) => {
    console.log("Selected device:", e.target.value); // Placeholder for device change action
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100">
        {/* Header with User Avatar and Filter Box */}
        <div className="flex items-center p-2">
          {/* User Avatar */}
          <div className="relative">
            <img
              src={user && user.picture ||"https://via.placeholder.com/40"} // Replace with actual user avatar URL
              alt={user && user.name || "User Avatar"}
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={handleAvatarClick}
            />
            {/* User Popup */}
            {isUserPopupVisible && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                <UserDeviceSelector onDeviceChange={(deviceId) => console.log("Active device changed to:", deviceId)} />
              </div>
            )}
          </div>

          {/* Filter Box */}
          <div className="flex-1 ml-4">
            <FilterBox filterText={filterText} setFilterText={setFilterText} />
          </div>
        </div>

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
