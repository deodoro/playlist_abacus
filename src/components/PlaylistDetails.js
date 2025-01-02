import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Operations from "../utils/operations";

const PlaylistDetails = ({
  playlist,
  setPlaylists,
  songs,
  repeats,
  selectedSong,
  setSelectedSong,
  setSongs,
  songRefs,
  setSteps,
  setSelectedPlaylists,
}) => {
  const [length, setLength] = useState(0);

  useEffect(() => {
    setLength(
      songs
        ? Math.round(
            songs.reduce((acc, { duration }) => acc + duration, 0) / 3600
          ) / 100
        : 0
    );
  }, [songs]);

  const handleDragStart = (e, song) => {
    e.dataTransfer.setData("song", JSON.stringify(song));
    e.dataTransfer.setData("playlist", playlist.id);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    // Implement drop logic as per original code.
  };

  const cloneList = () => {
    const newPlaylistName = prompt("Enter the new playlist name:");
    if (!newPlaylistName) return;

    const newPlaylist = { id: `${Date.now()}`, name: newPlaylistName };
    setPlaylists((prev) => [...prev, newPlaylist]);
    setSongs((prev) => ({
      ...prev,
      [newPlaylist.id]: songs.map((song, index) => ({ ...song, index })),
    }));
    setSteps((prev) => [
      ...prev,
      {
        op: Operations.OP_NEW_PLAYLIST,
        playlist: newPlaylist,
        uris: songs.map((song) => song.uri),
      },
    ]);
  };

  const handleDeleteList = () => {
    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;

    setSteps((prev) => [
      ...prev,
      { op: Operations.OP_DELETE_PLAYLIST, playlistId: playlist.id },
    ]);
    setPlaylists((prev) => prev.filter((p) => p.id !== playlist.id));
    setSongs((prev) => {
      const { [playlist.id]: _, ...rest } = prev;
      return rest;
    });
    setSelectedPlaylists((prev) =>
      prev.filter((p) => p.id !== playlist.id)
    );
  };

  return (
    <div
      className="bg-gray-100 p-4 rounded-md shadow-md h-[50vh] overflow-auto"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-between">
        {playlist.name}
        <span className="text-sm text-gray-600">{songs?.length || 0} songs</span>
        <span className="text-sm text-gray-600">{length} hours</span>
        <div className="flex space-x-2">
          <button
            className="text-blue-500 hover:underline"
            onClick={cloneList}
          >
            Clone
          </button>
          <button
            className="text-red-500 hover:underline"
            onClick={handleDeleteList}
          >
            Delete
          </button>
        </div>
      </h3>
      <ul className="divide-y divide-gray-200">
        {songs?.map((song, index) => (
          <li
            key={index}
            className={`flex items-center p-2 rounded-md ${
              repeats.some((r) => r.uri === song.uri)
                ? "bg-yellow-100"
                : "bg-white"
            } ${
              selectedSong?.uri === song.uri ? "bg-blue-500 text-white" : ""
            }`}
            draggable
            ref={(el) => {
              if (!songRefs.current[song.uri]) songRefs.current[song.uri] = [];
              songRefs.current[song.uri].push(el);
            }}
            onDragStart={(e) => handleDragStart(e, song)}
            onClick={() => setSelectedSong(song)}
            data-index={index}
          >
            <div className="flex-1 text-gray-600">{song.index + 1}. {song.name}</div>
            <div className="flex-1 text-gray-600">{song.artist}</div>
            <div className="w-16 truncate text-sm text-gray-500">
              {Math.floor(song.duration / 60)}:
              {String(Math.floor(song.duration % 60)).padStart(2, "0")}
            </div>
            <button
              className="ml-4 text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                // Implement delete song logic
              }}
            >
              ⊗
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

PlaylistDetails.propTypes = {
  playlist: PropTypes.object.isRequired,
  setPlaylists: PropTypes.func.isRequired,
  songs: PropTypes.array.isRequired,
  repeats: PropTypes.array.isRequired,
  selectedSong: PropTypes.object,
  setSelectedSong: PropTypes.func.isRequired,
  setSongs: PropTypes.func.isRequired,
  songRefs: PropTypes.object.isRequired,
  setSteps: PropTypes.func.isRequired,
  setSelectedPlaylists: PropTypes.func.isRequired,
};

export default PlaylistDetails;
