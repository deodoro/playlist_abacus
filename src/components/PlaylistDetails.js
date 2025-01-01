import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { createPlaylist, addSongsToPlaylist, deleteList } from "../utils/api";

const PlaylistDetails = ({
  playlist,
  setPlaylists,
  songs,
  repeats,
  selectedSong,
  setSelectedSong,
  setSongs,
  songRefs,
}) => {
  const [length, setLength] = useState(0);
  const handleDragStart = (e, song) => {
    e.dataTransfer.setData("song", JSON.stringify(song));
    e.dataTransfer.setData("playlist", playlist.id);
  };
  const handleDrop = (e) => {
    let firstRun = true;
    const song = JSON.parse(e.dataTransfer.getData("song"));
    const origPlaylistId = e.dataTransfer.getData("playlist");
    const targetSongIndex =
      e.target.closest(".song-detail-item")?.dataset.index; // Get the index of the target item

    console.log("HERE");
    setSongs((prevSongs) => {
      const updatedSongs = {
        ...prevSongs,
      };
      if (firstRun) {
        firstRun = false;
        if (playlist.id != origPlaylistId) {
            const targetIndex = targetSongIndex !== undefined
                ? parseInt(targetSongIndex, 10)
                : updatedSongs[playlist.id].length;
            const sourceIndex = song.index;
            console.log("THEN");
            updatedSongs[playlist.id].splice(targetIndex, 0, song); // Insert at the correct position
            for (let i = targetIndex; i < updatedSongs[playlist.id].length; i++) {
              updatedSongs[playlist.id][i].index = i;
            }
            updatedSongs[origPlaylistId].splice(sourceIndex, 1);
            for (let i = sourceIndex; i < updatedSongs[origPlaylistId].length; i++) {
                updatedSongs[origPlaylistId][i].index = i;
            }
          } else {
            const targetIndex =
              targetSongIndex !== undefined
                ? parseInt(targetSongIndex, 10)
                : updatedSongs[playlist.id].length - 1;
            const newIndex = targetIndex < song.index ? targetIndex : targetIndex + 1;
            const sourceIndex = song.index;
            updatedSongs[playlist.id].splice(sourceIndex, 1); // Remove the item from the source
            updatedSongs[playlist.id].splice(newIndex-1, 0, song); // Insert at the correct position
            for (let i = Math.max(0,Math.min(sourceIndex, targetIndex)-1); i < updatedSongs[playlist.id].length; i++) {
                updatedSongs[playlist.id][i].index = i;
            }
        }
    }

      return updatedSongs;
    });
  };

  const cloneList = async () => {
    const newPlaylistName = prompt("Enter the new playlist name:");
    if (!newPlaylistName) return;

    const confirmClone = window.confirm(
      "Are you sure you want to clone this playlist?"
    );
    if (!confirmClone) return;

    try {
      // Create a new playlist
      const newPlaylist = await createPlaylist(newPlaylistName);
      console.log(`New playlist created with ID: ${newPlaylist.id}`);
      setPlaylists((prevPlaylists) => [...prevPlaylists, newPlaylist]);

      // Extract song URIs
      const songUris = songs.map((song) => song.uri);

      // Add songs to the new playlist
      if (songUris.length > 0) {
        await addSongsToPlaylist(newPlaylist.id, songUris);
        console.log("Songs added to the cloned playlist.");
      } else {
        console.log("No songs to add.");
      }

      alert("Playlist cloned successfully!");
    } catch (error) {
      console.error("Error cloning playlist:", error.message);
      alert("An error occurred while cloning the playlist.");
    }
  };

  const handleDelete = (playlistId, song) => {
    setSongs((prevSongs) => {
      const updatedSongs = { ...prevSongs };
      updatedSongs[playlistId] = updatedSongs[playlistId].filter(
        (s) => s.name !== song.name || s.artist !== song.artist
      );
      for (let i = 0; i < updatedSongs[playlistId].length; i++) {
        updatedSongs[playlistId][i].index = i;
      }
      return updatedSongs;
    });
  };

  const handleDeleteList = async() => {
    const confirmDelete = window.confirm("Are you sure you want to delete this playlist?");
    if (!confirmDelete) return;
    console.log("NEXT")
    try {
        const result = await deleteList(playlist.id);
        console.log(result);
        setSongs((prevSongs) => {
            delete prevSongs[playlist.id];
            return prevSongs;
        })
        setPlaylists((prevPlaylists) => {
            return prevPlaylists.filter(p => p.id !== playlist.id);
        });
        alert("Playlist deleted successfully!");
    } catch (error) {
        console.error("Error deleting playlist:", error.message);
        alert("An error occurred while deleting the playlist.");
    }
  }

  useEffect(() => {
    if (songs)
        setLength(Math.round(songs.map(i => i.duration).reduce((acc, d) => acc + d, 0)/36)/100);
    else
        setLength(0);
  }, [songs]);

  return (
    <div
      className="playlist-details"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h3>
        {playlist.name}
        <span className="info count">
          {songs?.length || 0} songs
        </span>
        <span className="info duration">
          {length} hours
        </span>
        <a href="#" className="clone-button" onClick={cloneList}>
          clone
        </a>
        <a href="#" className="delete-button" onClick={handleDeleteList}>
          delete
        </a>
      </h3>
      <ul className="song-details">

        {songs?.map((song, index) => (
          <li
            key={index}
            className={`song-detail-item ${
              repeats.some(
                (r) => r.name === song.name && r.artist === song.artist
              )
                ? "repeat"
                : ""
            } ${
              selectedSong?.name === song.name &&
              selectedSong?.artist === song.artist
                ? "selected"
                : ""
            }`}
            draggable
            ref={(el) => {
              if (!songRefs.current[song.uri]) {
                songRefs.current[song.uri] = [];
              }
              songRefs.current[song.uri].push(el);
            }}
            onDragStart={(e) => handleDragStart(e, song)}
            onClick={() => setSelectedSong(song)}
            data-index={index}
          >
            <div className="song-index"> {song.index + 1} </div>
            <div className="song-name"> {song.name} </div>
            <div className="song-artist"> {song.artist} </div>
            <div className="song-duration">
              {Math.floor(song.duration / 60)}:
              {String(Math.floor(song.duration % 60)).padStart(2, "0")}
            </div>
            <div className="delete-icon" onClick={() => handleDelete(playlist.id, song)}>🗑️</div>
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
};

export default PlaylistDetails;
