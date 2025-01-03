import React from "react";
import PropTypes from "prop-types";

const SongList = ({ songs, selectedSong, selectSong, repeats, songRefs }) => {
  const handleDragStart = (e, song) => {
    e.dataTransfer.setData("song", JSON.stringify(song));
    e.dataTransfer.setData("playlist", "master");
  };

  return (
    <ul className="divide-y divide-gray-300 px-2">
      {songs.map((song, index) => (
        <li
          key={index}
          className={`flex items-center justify-between cursor-pointer py-2 ${
            repeats.some((r) => r.uri === song.uri) && (selectedSong?.uri !== song.uri)
              ? "text-orange-300 font-[400]"
              : "text-gray-800"
          } ${
            selectedSong?.uri === song.uri
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-400"
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
          {/* Left Section: Song Image */}
          <div className="flex-shrink-0">
            <img
              src={song.image || "https://via.placeholder.com/40"}
              alt={song.name}
              className="w-10 h-10 rounded-full"
            />
          </div>

          {/* Middle Section: Song Details */}
          <div className="flex flex-col flex-1 px-4 truncate">
            <span className={`text-wrap ${
                selectedSong?.uri === song.uri
                ? "text-white"
                : ""
            }`}>{song.name}</span>
            <span className={`text-sm text-wrap ${
                selectedSong?.uri === song.uri
                ? "text-gray-400"
                : "opacity-60"
            }`}>{song.artist}</span>
          </div>

          {/* Right Section: Song Duration */}
          <div className={"text-gray-300 text-sm font-semibold"} >
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
