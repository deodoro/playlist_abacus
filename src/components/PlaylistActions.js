import React, { useState } from "react";
import PropTypes from "prop-types";
import { deduplicate } from "../utils/helpers";

const PlaylistActions = ({
  selectedPlaylists,
  setPlaylists,
  setSongs,
  actionPlaylistName,
  setActionPlaylistName,
  repeats,
}) => {
  const [selectedAction, setSelectedAction] = useState(null);

  const handleExecute = () => {
    if (!actionPlaylistName || !selectedAction) return;

    const newPlaylist = { id: `${Date.now()}`, name: actionPlaylistName };
    setPlaylists((prev) => [...prev, newPlaylist]);
    setSongs((prev) => {
      const updatedSongs = { ...prev };
      switch (selectedAction) {
        case "merge":
          updatedSongs[newPlaylist.id] = deduplicate(
            selectedPlaylists.flatMap((p) => prev[p.id] || [])
          );
          break;
        case "intersect":
          updatedSongs[newPlaylist.id] = repeats;
          break;
        case "diff":
          updatedSongs[newPlaylist.id] = deduplicate(
            selectedPlaylists.reduce((acc, p, idx) => {
              const songsList = prev[p.id] || [];
              return idx === 0
                ? songsList
                : acc.filter(
                    (song) =>
                      !songsList.some(
                        (s) => s.name === song.name && s.artist === song.artist
                      )
                  );
            }, [])
          );
          break;
        default:
          break;
      }
      return updatedSongs;
    });
    setActionPlaylistName("");
    setSelectedAction(null); // Reset selected action after execution
  };

  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-md h-[50vh] overflow-hidden">
      <h3 className="text-lg font-semibold mb-2">Actions</h3>
      <input
        type="text"
        className="w-full mb-2 p-2 border rounded text-gray-800"
        placeholder="New Playlist Name"
        value={actionPlaylistName}
        onChange={(e) => setActionPlaylistName(e.target.value)}
      />
      <div className="mb-4">
        <button
          className={`w-full p-2 rounded mb-2 ${
            selectedAction === "merge"
              ? "bg-blue-600 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
          onClick={() => setSelectedAction("merge")}
          disabled={selectedPlaylists.length < 2}
        >
          Merge
        </button>
        <button
          className={`w-full p-2 rounded mb-2 ${
            selectedAction === "intersect"
              ? "bg-yellow-600 text-white"
              : "bg-yellow-500 text-white hover:bg-yellow-600"
          }`}
          onClick={() => setSelectedAction("intersect")}
          disabled={!repeats || repeats.length === 0}
        >
          Intersect
        </button>
        <button
          className={`w-full p-2 rounded ${
            selectedAction === "diff"
              ? "bg-red-600 text-white"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
          onClick={() => setSelectedAction("diff")}
          disabled={selectedPlaylists.length < 2}
        >
          Subtract
        </button>
      </div>
      <button
        className={`w-full p-2 rounded ${
          actionPlaylistName && selectedAction
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        onClick={handleExecute}
        disabled={!actionPlaylistName || !selectedAction}
      >
        Execute
      </button>
    </div>
  );
};

PlaylistActions.propTypes = {
  selectedPlaylists: PropTypes.array.isRequired,
  playlists: PropTypes.array.isRequired,
  setPlaylists: PropTypes.func.isRequired,
  setSongs: PropTypes.func.isRequired,
  actionPlaylistName: PropTypes.string.isRequired,
  setActionPlaylistName: PropTypes.func.isRequired,
  repeats: PropTypes.array.isRequired,
};

export default PlaylistActions;
