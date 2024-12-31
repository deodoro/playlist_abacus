import React, { useState, useEffect, useRef } from "react";
import './Navigator.css';

const Navigator = () => {
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const [selectedSong, setSelectedSong] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [playlists, setPlaylists] = useState([]);
    const [songs, setSongs] = useState({});
    const [repeats, setRepeats] = useState([]);
    const songRefs = useRef({});

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
                            artist: item.track.artists.map(artist => artist.name).join(", "),
                            duration: item.track.duration_ms / 1000 // Save duration in seconds
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
        else {
            setRepeats([]);
        }
    }, [selectedPlaylists, songs]);

    const filteredPlaylists = playlists.filter((playlist) =>
        playlist.name.toLowerCase().includes(filterText.toLowerCase())
    );

    const findRepeats = (updatedSongs) => {
        let repeatsList = [];
        if (selectedPlaylists.length > 1) {
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
        }
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

    const deselectAllPlaylists = () => {
        setSelectedPlaylists([]);
    };

    const selectSong = (song) => {
        setSelectedSong(song);
        if (songRefs.current[song.name]) {
            songRefs.current[song.name].scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }

    const deduplicate = (array) => {
        const sortedSongs = array.sort((a, b) => {
            const nameComparison = a.name.localeCompare(b.name);
            if (nameComparison !== 0) {
                return nameComparison;
            }
            return a.artist.localeCompare(b.artist);
        });
        return sortedSongs.filter((song, index) => index === 0 || sortedSongs[index - 1].name !== song.name && sortedSongs[index - 1].artist !== song.artist);
    };

    const allSongsFromSelectedPlaylists = deduplicate(
        selectedPlaylists
            .map((playlist) => songs[playlist.id] || [])
            .flat()
    );

    const filteredSongs = allSongsFromSelectedPlaylists.filter((song) =>
        song.name.toLowerCase().includes(filterText.toLowerCase()) || song.artist.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div className="navigator-container">
            {/* Left Panel */}
            <div className="left-panel">
                {/* Filter Box */}
                <div className="filter-container">
                    <input
                        type="text"
                        placeholder="Filter..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="filter-box"
                    />
                    {filterText && (
                        <button
                            className="clear-filter"
                            onClick={() => setFilterText("")}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Playlist Section */}
                <div className="playlists">
                    <div className="playlists-header">
                        <h3><span>Playlists</span>
                        <button
                            className="deselect-all"
                            onClick={deselectAllPlaylists}
                            disabled={selectedPlaylists.length > 0 ? false : true}
                        >
                            Deselect All
                        </button>
                        </h3>
                    </div>
                    <ul className="playlist-list">
                        {filteredPlaylists.sort((a,b) => a.name.localeCompare(b.name)).map((playlist, index) => (
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

                {/* Songs from Selected Playlists Section */}
                <div className="songs">
                    <h3>Songs</h3>
                    <ul className="song-list">
                        {filteredSongs.map((song, index) => (
                            <li
                                key={index}
                                className={`song-item ${repeats.some(r => r.name === song.name && r.artist === song.artist) ? 'repeat' : ''} ${selectedSong?.name === song.name && selectedSong?.artist === song.artist ? 'selected' : ''}`}
                                onClick={() => selectSong(song)}
                            >
                                <div className="song-name">{song.name}</div>
                                <div className="song-artist">{song.artist}</div>
                                <div className="song-duration">{Math.floor(song.duration / 60)}:{Math.floor(song.duration % 60).toString().padStart(2, '0')}</div>
                                <div className="delete-icon">🗑️</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Panel */}
            <div className="right-panel">
                {selectedPlaylists.map((playlist) => (
                    <div
                        key={playlist.id}
                        className={`playlist-details ${songs[playlist.id]?.some(song => selectedSong?.name === song.name && selectedSong?.artist === song.artist) ? 'selected' : ''}`}
                    >
                        <h3>{playlist.name}</h3>
                        <ul className="song-details">
                            {songs[playlist.id]?.map((song, index) => (
                                <li key={index} className={`song-detail-item ${repeats.some(r => r.name === song.name && r.artist === song.artist) ? 'repeat' : ''} ${selectedSong?.name === song.name && selectedSong?.artist === song.artist ? 'selected' : ''}`}
                                ref={(el) => (songRefs.current[song.name] = el)}>
                                    <div className="song-index">{index+1}</div>
                                    <div className="song-name">{song.name}</div>
                                    <div className="song-artist">{song.artist}</div>
                                    <div className="song-duration">{Math.floor(song.duration / 60)}:{Math.floor(song.duration % 60).toString().padStart(2, '0')}</div>
                                    <div className="delete-icon">🗑️</div>
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
