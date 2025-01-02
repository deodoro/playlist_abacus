import React from "react";
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
  const handleAction = (actionType) => {
    if (!actionPlaylistName) return;

    const newPlaylist = { id: `${Date.now()}`, name: actionPlaylistName };
    setPlaylists((prev) => [...prev, newPlaylist]);
    setSongs((prev) => {
      const updatedSongs = { ...prev };
      switch (actionType) {
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
  };

  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-md h-[50vh] overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Actions</h3>
      <input
        type="text"
        className="w-full mb-2 p-2 border rounded"
        placeholder="New Playlist Name"
        value={actionPlaylistName}
        onChange={(e) => setActionPlaylistName(e.target.value)}
      />
      <button
        className="w-full bg-blue-500 text-white p-2 rounded mb-2"
        onClick={() => handleAction("merge")}
        disabled={selectedPlaylists.length < 2}
      >
        Merge
      </button>
      <button
        className="w-full bg-yellow-500 text-white p-2 rounded mb-2"
        onClick={() => handleAction("intersect")}
        disabled={!repeats || repeats.length === 0}
      >
        Intersect
      </button>
      <button
        className="w-full bg-red-500 text-white p-2 rounded"
        onClick={() => handleAction("diff")}
        disabled={selectedPlaylists.length < 2}
      >
        Diff
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
  setSelectedPlaylists: PropTypes.func.isRequired,
};

export default PlaylistActions;
