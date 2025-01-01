import { useState, useEffect } from "react";
import { fetchPlaylists, fetchSongs } from "../utils/api";
import PropTypes from "prop-types";

const useNavigatorState = () => {
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState({});
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);

  useEffect(() => {
    fetchPlaylists().then((data) =>
            setPlaylists(data.items.map((playlist) => ({
                id: playlist.id,
                name: playlist.name
            }))))
            .catch(console.error);
        }, []);

  const fetchPlaylistSongs = (playlistId) => {
      console.log("FETCHING SONGS");
      fetchSongs(playlistId).then((data) => {
        let idx = 0;
        const items = data.items.map((item) => ({
            name: item.track.name,
            artist: item.track.artists.map(artist => artist.name).join(", "),
            duration: item.track.duration_ms / 1000,
            uri: item.track.uri,
            index: idx++
        }))
        setSongs((prev) => ({ ...prev, [playlistId]: items }));
      });
  };

  return { playlists, setPlaylists, songs, setSongs, selectedPlaylists, setSelectedPlaylists, fetchPlaylistSongs };
};

useNavigatorState.propTypes = {
  playlists: PropTypes.array.isRequired,
  setPlaylists: PropTypes.func.isRequired,
  songs: PropTypes.object.isRequired,
  setSongs: PropTypes.func.isRequired,
  selectedPlaylists: PropTypes.array.isRequired,
  setSelectedPlaylists: PropTypes.func.isRequired,
  fetchPlaylistSongs: PropTypes.func.isRequired,
};

export default useNavigatorState;
