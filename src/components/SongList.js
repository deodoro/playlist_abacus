import React from "react";
import PropTypes from "prop-types";

// TODO: Drag to playlists

const SongList = ({ songs, selectedSong, selectSong, repeats, songRefs }) => {
    const handleDragStart = (e, song) => {
        e.dataTransfer.setData("song", JSON.stringify(song));
        e.dataTransfer.setData("playlist", "master");
      };
    return (
        <ul className="song-list">
            {songs.map((song, index) => (
            <li
                key={index}
                className={`song-item ${
                repeats.some((r) => r.uri == song.uri)
                    ? "repeat"
                    : ""
                } ${
                selectedSong?.uri === song.uri
                    ? "selected"
                    : ""
                }`}
                onClick={() => selectSong(song)}
                ref={(el) => {
                    if (!songRefs.current[song.uri]) {
                    songRefs.current[song.uri] = [];
                    }
                    songRefs.current[song.uri].push(el);
                }}
                onDragStart={(e) => handleDragStart(e, song)}
                draggable
            >
                <div className="song-name">{song.name}</div>
                <div className="song-artist">{song.artist}</div>
                <div className="song-duration">
                {Math.floor(song.duration / 60)}:
                {Math.floor(song.duration % 60).toString().padStart(2, "0")}
                </div>
            </li>
            ))}
        </ul>
    );
}

SongList.propTypes = {
    songs: PropTypes.array.isRequired,
    selectedSong: PropTypes.object,
    selectSong: PropTypes.func.isRequired,
    repeats: PropTypes.array.isRequired,
    songRefs: PropTypes.object.isRequired,
}

export default SongList;
