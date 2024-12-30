import React, { useState } from "react";

const Navigator = () => {
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [selectedSong, setSelectedSong] = useState(null);
    const [filterText, setFilterText] = useState("");

    const playlists = ["Playlist 1", "Playlist 2", "Playlist 3"];
    const songs = ["Song 1", "Song 2", "Song 3", "Song 4"];

    const filteredPlaylists = playlists.filter((playlist) =>
        playlist.toLowerCase().includes(filterText.toLowerCase())
    );

    const filteredSongs = songs.filter((song) =>
        song.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* Left Panel */}
            <div
                style={{
                    width: "25%",
                    borderRight: "1px solid #ccc",
                    padding: "10px",
                    boxSizing: "border-box",
                }}
            >
                {/* Filter Box */}
                <input
                    type="text"
                    placeholder="Filter..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "8px",
                        marginBottom: "10px",
                        boxSizing: "border-box",
                    }}
                />

                {/* Playlist Section */}
                <div>
                    <h3>Playlists</h3>
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        {filteredPlaylists.map((playlist, index) => (
                            <li
                                key={index}
                                onClick={() => setSelectedPlaylist(playlist)}
                                style={{
                                    padding: "8px",
                                    cursor: "pointer",
                                    backgroundColor:
                                        selectedPlaylist === playlist
                                            ? "#ddd"
                                            : "transparent",
                                }}
                            >
                                {playlist}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Songs Section */}
                <div>
                    <h3>Songs</h3>
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        {filteredSongs.map((song, index) => (
                            <li
                                key={index}
                                onClick={() => setSelectedSong(song)}
                                style={{
                                    padding: "8px",
                                    cursor: "pointer",
                                    backgroundColor:
                                        selectedSong === song
                                            ? "#ddd"
                                            : "transparent",
                                }}
                            >
                                {song}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Panel */}
            <div
                style={{
                    flex: 1,
                    backgroundColor: "#ccc",
                }}
            >
                {/* Placeholder for right panel content */}
            </div>
        </div>
    );
};

export default Navigator;
