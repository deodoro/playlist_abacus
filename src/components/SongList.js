import React from "react";
import PropTypes from "prop-types";

const SongList = ({ songs, selectedSong, selectSong, repeats, songRefs }) => {
  const handleDragStart = (e, song) => {
    e.dataTransfer.setData("song", JSON.stringify(song));
    e.dataTransfer.setData("playlist", "master");
  };

  return (
    <ul className="divide-y divide-gray-200">
      {songs.map((song, index) => (
        <li
          key={index}
          className={`p-4 flex items-center justify-between rounded-md cursor-pointer ${
            repeats.some((r) => r.uri === song.uri)
              ? "bg-yellow-100"
              : "bg-white"
          } ${
            selectedSong?.uri === song.uri
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-100"
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
          <div className="flex-1 text-gray-800 truncate">{song.name}</div>
          <div className="flex-1 text-gray-600 truncate">{song.artist}</div>
          <div className="text-gray-500 text-sm">
            {Math.floor(song.duration / 60)}:
            {Math.floor(song.duration % 60).toString().padStart(2, "0")}
          </div>
        </li>
      ))}
    </ul>
  );
};

SongList.propTypes = {
  songs: PropTypes.array.isRequired,
  selectedSong: PropTypes.object,
  selectSong: PropTypes.func.isRequired,
  repeats: PropTypes.array.isRequired,
  songRefs: PropTypes.object.isRequired,
};

export default SongList;
