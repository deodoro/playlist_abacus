import { useState, useEffect } from 'react';
import { fetchPlaylists, fetchSongs, fetchFavoriteSongs } from '../utils/api';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const useNavigatorState = () => {
    const [playlists, setPlaylists] = useState([]);
    const [songs, setSongs] = useState({});
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const [steps, setSteps] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadPlaylists = async () => {
            try {
                const data = await fetchPlaylists();
                const favoriteSongs = await fetchFavoriteSongs();

                const favoritePlaylist = {
                    id: 'FAVORITES',
                    name: 'Favorites',
                    track_count: favoriteSongs.length,
                };

                setPlaylists([
                    ...data.map((playlist) => ({
                        id: playlist.id,
                        name: playlist.name,
                        track_count: playlist.tracks.total,
                    })),
                    favoritePlaylist, // Append special playlist for favorites
                ]);
                setSongs((prev) => ({
                    ...prev,
                    FAVORITES: favoriteSongs.map((track, idx) => ({
                        name: track.name,
                        artist: track.artists.map((artist) => artist.name).join(', '),
                        duration: track.duration_ms / 1000,
                        uri: track.uri,
                        index: idx,
                        image: track.album.images?.[0]?.url || null,
                        favorite: true
                    })),
                }));
            } catch (err) {
                if (err.name === 'UnauthorizedError') {
                    navigate('/'); // Redirect on unauthorized
                } else {
                    console.error('Failed to fetch playlists:', err);
                }
            }
        };

        loadPlaylists();
    }, [navigate]);

    const fetchPlaylistSongs = (playlistId) => {
        if (playlistId === 'FAVORITES') {
            return Promise.resolve(); // No need to refetch, already loaded
        }
        else {
            const favs = songs.FAVORITES.map((song) => song.uri);
            return fetchSongs(playlistId)
                .then((data) => {
                    let idx = 0;
                    const items = data.map((item) => ({
                        name: item.track.name,
                        artist: item.track.artists
                            .map((artist) => artist.name)
                            .join(', '),
                        duration: item.track.duration_ms / 1000,
                        uri: item.track.uri,
                        index: idx++,
                        image: item.track.album.images?.[0]?.url || null,
                        favorite:  favs.filter((fav) => fav === item.track.uri).length > 0,
                    }));

                    setSongs((prev) => ({ ...prev, [playlistId]: items }));
                })
                .catch((err) => {
                    if (err.name === 'UnauthorizedError') {
                        navigate('/');
                    } else {
                        console.error('Failed to fetch playlist songs:', err);
                    }
                });
        }
    };

    return {
        playlists,
        setPlaylists,
        songs,
        setSongs,
        selectedPlaylists,
        setSelectedPlaylists,
        fetchPlaylistSongs,
        steps,
        setSteps,
    };
};

useNavigatorState.propTypes = {
    playlists: PropTypes.array.isRequired,
    setPlaylists: PropTypes.func.isRequired,
    songs: PropTypes.object.isRequired,
    setSongs: PropTypes.func.isRequired,
    selectedPlaylists: PropTypes.array.isRequired,
    setSelectedPlaylists: PropTypes.func.isRequired,
    fetchPlaylistSongs: PropTypes.func.isRequired,
    steps: PropTypes.array.isRequired,
    setSteps: PropTypes.func.isRequired,
};

export default useNavigatorState;
