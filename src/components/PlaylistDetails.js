import React from "react";
import PropTypes from "prop-types";

const PlaylistDetails = ({
  playlist,
  songs,
  repeats,
  selectedSong,
  setSelectedSong,
  setSongs,
  songRefs,
}) => {
  const handleDragStart = (e, song) => {
    e.dataTransfer.setData("song", JSON.stringify(song));
    e.dataTransfer.setData("playlist", playlist.id);
  };
  const handleDrop = (e) => {
    const song = JSON.parse(e.dataTransfer.getData("song"));
    const origPlaylistId = e.dataTransfer.getData("playlist");
    const targetSongIndex = e.target.closest(".song-detail-item")?.dataset.index; // Get the index of the target item

    setSongs((prevSongs) => {
      const updatedSongs = { ...prevSongs };
        const exists = updatedSongs[playlist.id].some((s) => s.name === song.name && s.artist === song.artist);
        if (!exists) {
            const index = targetSongIndex !== undefined ? parseInt(targetSongIndex, 10) : updatedSongs[playlist.id].length;
            updatedSongs[playlist.id].splice(index, 0, song); // Insert at the correct position
            console.log("index", index);
            for (let i = index; i < updatedSongs[playlist.id].length; i++) {
                updatedSongs[playlist.id][i].index = i;
            }
        }

        updatedSongs[origPlaylistId] = updatedSongs[origPlaylistId].filter((s) => s.name !== song.name || s.artist !== song.artist);

      return updatedSongs;
    });
  };

  return (
    <div
      className="playlist-details"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <h3>
        {playlist.name}
        <span className="info count">{songs?.length || 0} songs</span>
      </h3>
      <ul className="song-details">
        {songs?.map((song, index) => (
          <li
            key={index}
            className={`song-detail-item ${
              repeats.some((r) => r.name === song.name && r.artist === song.artist) ? "repeat" : ""
            } ${selectedSong?.name === song.name && selectedSong?.artist === song.artist ? "selected" : ""}`}
            draggable
            ref = {
                (el) => {
                    if (!songRefs.current[song.uri]) {
                        songRefs.current[song.uri] = [];
                    }
                    songRefs.current[song.uri].push(el);
                }
            }
            onDragStart={(e) => handleDragStart(e, song)}
            onClick={() => setSelectedSong(song)}
            data-index={index}
          >
            <div className="song-index">{index + 1}</div>
            <div className="song-name">{song.name}</div>
            <div className="song-artist">{song.artist}</div>
            <div className="song-duration">{Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, "0")}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

PlaylistDetails.propTypes = {
    playlist: PropTypes.object.isRequired,
    songs: PropTypes.array.isRequired,
    repeats: PropTypes.array.isRequired,
    selectedSong: PropTypes.object,
    setSelectedSong: PropTypes.func.isRequired,
    setSongs: PropTypes.func.isRequired,
    songRefs: PropTypes.object.isRequired,
};

export default PlaylistDetails;
