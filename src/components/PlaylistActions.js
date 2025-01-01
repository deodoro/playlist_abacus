import React from "react";
import { deduplicate } from "../utils/helpers";
import PropTypes from "prop-types";

const PlaylistActions = ({
  selectedPlaylists,
  playlists,
  setPlaylists,
  setSongs,
  actionPlaylistName,
  setActionPlaylistName,
  repeats,
  setSelectedPlaylists,
}) => {
  const handleAction = (actionType) => {
    if (!actionPlaylistName) return;
    console.log(playlists);
    const newPlaylist = {
      id: `${Date.now()}`,
      name: actionPlaylistName,
    };

    setPlaylists([...playlists, newPlaylist]);
    setSelectedPlaylists((prev) => [...prev, newPlaylist]);

    setSongs((prevSongs) => {
      let updatedSongs = { ...prevSongs };

      switch (actionType) {
        case "merge":
          updatedSongs[newPlaylist.id] = deduplicate(
            selectedPlaylists.flatMap((p) => prevSongs[p.id] || [])
          );
          break;

        case "intersect":
          updatedSongs[newPlaylist.id] = repeats;
          break;

        case "diff":
          updatedSongs[newPlaylist.id] = deduplicate(
            selectedPlaylists.reduce((acc, p, idx) => {
              const songsList = prevSongs[p.id] || [];
              if (idx === 0) return songsList;
              return acc.filter(
                (song) => !songsList.some((s) => s.name === song.name && s.artist === song.artist)
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
    <div className="playlist-actions playlist-details merge">
      <h3>Actions</h3>
      <div>
        <input
          type="text"
          placeholder="New Playlist Name"
          value={actionPlaylistName}
          onChange={(e) => setActionPlaylistName(e.target.value)}
        />
        <p><a href="#" onClick={() => handleAction("merge")} disabled={selectedPlaylists.length < 2}>
          Merge
        </a> all songs from selected playlists</p>

        <p><a href="#" onClick={() => handleAction("intersect")} disabled={repeats && repeats.length === 0}>
          Intersect
        </a> songs in all selected lists</p>
        <p><a href="#" onClick={() => handleAction("diff")} disabled={selectedPlaylists.length < 2}>
          Diff
        </a> songs in first list not in others</p>
      </div>
    </div>
  );
};

PlaylistActions.propTypes = {
    selectedPlaylists: PropTypes.array.isRequired,
    playlists: PropTypes.array.isRequired,
    setPlaylists: PropTypes.func.isRequired,
    songs: PropTypes.object.isRequired,
    setSongs: PropTypes.func.isRequired,
    actionPlaylistName: PropTypes.string.isRequired,
    setActionPlaylistName: PropTypes.func.isRequired,
    repeats: PropTypes.array.isRequired,
    setSelectedPlaylists: PropTypes.func.isRequired,
};

export default PlaylistActions;
