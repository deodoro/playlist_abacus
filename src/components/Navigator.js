import React, { useState, useEffect } from "react";
import './Navigator.css';

const Navigator = () => {
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [songs, setSongs] = useState({});
    const [repeats, setRepeats] = useState([]);

    const fetchPlaylists = async () => {
        const token = localStorage.getItem("spotifyAccessToken");
        if (!token) {
            console.error("No Spotify token found in localStorage.");
            return;
        }

        try {
            const response = await fetch("https://api.spotify.com/v1/me/playlists", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPlaylists(data.items.map((playlist) => ({
                    id: playlist.id,
                    name: playlist.name
                })));
            } else {
                console.error("Failed to fetch playlists", response.status);
            }
        } catch (error) {
            console.error("Error fetching playlists", error);
        }
    };

    const fetchSongs = async (playlistId) => {
        const token = localStorage.getItem("spotifyAccessToken");
        if (!token || !playlistId) {
            console.error("No Spotify token or playlist ID available.");
            return;
        }

        try {
            const response = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSongs((prevSongs) => {
                    const updatedSongs = {
                        ...prevSongs,
                        [playlistId]: data.items.map((item) => ({
                            name: item.track.name,
                            artist: item.track.artists.map(artist => artist.name).join(", ")
                        }))
                    };
                    return updatedSongs;
                });
            } else {
                console.error("Failed to fetch songs", response.status);
            }
        } catch (error) {
            console.error("Error fetching songs", error);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    useEffect(() => {
        if (selectedPlaylists.length > 0) {
            findRepeats(songs);
        }
    }, [selectedPlaylists, songs]);

    const filteredPlaylists = playlists.filter((playlist) =>
        playlist.name.toLowerCase().includes(filterText.toLowerCase())
    );

    const findRepeats = (updatedSongs) => {
        let repeatsList = [];
        let flag = true;
        selectedPlaylists.forEach(playlist => {
            let selectedSongs = updatedSongs[playlist.id] || songs[playlist.id];
            if (selectedSongs) {
                if (flag) {
                    repeatsList = [...selectedSongs];
                    flag = false;
                } else {
                    repeatsList = repeatsList.filter(song =>
                        selectedSongs.some(s => s.name === song.name && s.artist === song.artist)
                    );
                }
            }
        });
        setRepeats(repeatsList);
    };

    const togglePlaylistSelection = (playlist) => {
        if (selectedPlaylists.some((p) => p.id === playlist.id)) {
            setSelectedPlaylists(selectedPlaylists.filter((p) => p.id !== playlist.id));
        } else {
            setSelectedPlaylists([...selectedPlaylists, playlist]);
            fetchSongs(playlist.id);
        }
    };

    return (
        <div className="navigator-container">
            {/* Left Panel */}
            <div className="left-panel">
                {/* Filter Box */}
                <input
                    type="text"
                    placeholder="Filter..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="filter-box"
                />

                {/* Playlist Section */}
                <div>
                    <h3>Playlists</h3>
                    <ul className="playlist-list">
                        {filteredPlaylists.map((playlist, index) => (
                            <li
                                key={index}
                                onClick={() => togglePlaylistSelection(playlist)}
                                className={`playlist-item ${selectedPlaylists.some((p) => p.id === playlist.id) ? 'selected' : ''}`}
                            >
                                {playlist.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Panel */}
            <div className="right-panel">
                {selectedPlaylists.map((playlist) => (
                    <div key={playlist.id} className="playlist-details">
                        <h3>{playlist.name}</h3>
                        <ul className="song-details">
                            {songs[playlist.id]?.map((song, index) => (
                                <li key={index} className={`song-detail-item ${repeats.some(r => r.name === song.name && r.artist === song.artist) ? 'repeat' : ''}`}>
                                    <div className="song-name">{song.name}</div>
                                    <div className="song-artist">{song.artist}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Navigator;
