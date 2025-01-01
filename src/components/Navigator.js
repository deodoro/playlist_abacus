import React, { useState, useEffect, useRef } from "react";
import './Navigator.css';
import FilterBox from "./FilterBox";
import useNavigatorState from "../hooks/useNavigatorState";
import { deduplicate, findRepeats } from "../utils/helpers";
import PlaylistSection from "./PlaylistSection";
import SongsSection from "./SongsSection";
import PlaylistDetails from "./PlaylistDetails";
import PlaylistActions from "./PlaylistActions";

const Navigator = () => {

    const {
        playlists,
        setPlaylists,
        songs,
        setSongs,
        selectedPlaylists,
        setSelectedPlaylists,
        fetchPlaylistSongs,
      } = useNavigatorState();

    const [selectedSong, setSelectedSong] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [repeats, setRepeats] = useState([]);
    const songRefs = useRef({});
    const [newPlaylistName, setNewPlaylistName] = useState("");

    useEffect(() => {
        if (selectedPlaylists.length > 0) {
          setRepeats(findRepeats(songs, selectedPlaylists));
        } else {
          setRepeats([]);
        }
    }, [selectedPlaylists, songs]);

    const togglePlaylistSelection = (playlist) => {
        if (selectedPlaylists.some((p) => p.id === playlist.id)) {
            setSelectedPlaylists(selectedPlaylists.filter((p) => p.id !== playlist.id));
        } else {
            setSelectedPlaylists([...selectedPlaylists, playlist]);
            console.log("TO FETCH SONGS");
            if (!(playlist.id in songs))
                fetchPlaylistSongs(playlist.id);
        }
    };

    const selectSong = (song) => {
        setSelectedSong(song);
        if (songRefs.current[song.uri]) {
            songRefs.current[song.uri].forEach((ref) => {
                if (ref) {
                    ref.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            })
        }
    }

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
                <FilterBox filterText={filterText} setFilterText={setFilterText} />
                <PlaylistSection playlists={playlists} selectedPlaylists={selectedPlaylists} togglePlaylistSelection={togglePlaylistSelection} />
                <SongsSection songs={filteredSongs} selectedSong={selectedSong} selectSong={selectSong} repeats={repeats} />
            </div>

            <div className="right-panel">
                {selectedPlaylists.map((playlist) => (
                    <PlaylistDetails key={playlist.id} playlist={playlist} setPlaylists={setPlaylists} songs={songs[playlist.id]} repeats={repeats} selectedSong={selectedSong} setSelectedSong={setSelectedSong} setSongs={setSongs} songRefs={songRefs} />
                ))}
                <PlaylistActions selectedPlaylists={selectedPlaylists} playlists={playlists} setPlaylists={setPlaylists} songs={songs} setSongs={setSongs} actionPlaylistName={newPlaylistName} setActionPlaylistName={setNewPlaylistName} setSelectedPlaylists={setSelectedPlaylists} />
            </div>
        </div>
    );
};

export default Navigator;
