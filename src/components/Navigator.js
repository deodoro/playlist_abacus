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
    // const [newMergePlaylistName, setNewMergePlaylistName] = useState("");
    // const [newIntersectPlaylistName, setNewIntersectPlaylistName] = useState("");
    // const [newDiffPlaylistName, setNewDiffPlaylistName] = useState("");
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
            if (!(playlist.id in songs))
                fetchPlaylistSongs(playlist.id);
        }
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

    const allSongsFromSelectedPlaylists = deduplicate(
        selectedPlaylists
            .map((playlist) => songs[playlist.id] || [])
            .flat()
    );

    const filteredSongs = allSongsFromSelectedPlaylists.filter((song) =>
        song.name.toLowerCase().includes(filterText.toLowerCase()) || song.artist.toLowerCase().includes(filterText.toLowerCase())
    );

    // const handleDragStart = (e, song, playlist_id) => {
    //     e.dataTransfer.setData("song", JSON.stringify(song));
    //     e.dataTransfer.setData("playlist", playlist_id);
    // };

    // const handleDrop = (e, playlistId) => {
    //     const song = JSON.parse(e.dataTransfer.getData("song"));
    //     const orig_playlist = e.dataTransfer.getData("playlist");
    //     const targetSongIndex = e.target.closest(".song-detail-item")?.dataset.index; // Get the index of the target item
    //     console.dir(orig_playlist);

    //     setSongs((prevSongs) => {
    //         const updatedSongs = { ...prevSongs };
    //         if (!updatedSongs[playlistId]) {
    //             updatedSongs[playlistId] = [];
    //         }

    //         // Avoid duplicates
    //         const exists = updatedSongs[playlistId].some((s) => s.name === song.name && s.artist === song.artist);
    //         if (!exists) {
    //             const index = targetSongIndex !== undefined ? parseInt(targetSongIndex, 10) : updatedSongs[playlistId].length;
    //             updatedSongs[playlistId].splice(index, 0, song); // Insert at the correct position
    //             for (let i = index; i < updatedSongs[playlistId].length; i++) {
    //                 updatedSongs[playlistId][i].index = i;
    //             }
    //         }
    //         updatedSongs[orig_playlist] = updatedSongs[orig_playlist].filter((s) => s.name !== song.name || s.artist !== song.artist);

    //         return updatedSongs;
    //     });
    // };

    // const handleDelete = (playlistId, song) => {
    //     setSongs((prevSongs) => {
    //         const updatedSongs = { ...prevSongs };
    //         updatedSongs[playlistId] = updatedSongs[playlistId].filter(
    //             (s) => s.name !== song.name || s.artist !== song.artist
    //         );
    //         for (let i = 0; i < updatedSongs[playlistId].length; i++) {
    //             updatedSongs[playlistId][i].index = i;
    //         }
    //         return updatedSongs;
    //     });
    // };

    // const mergePlaylists = () => {
    //     const newPlaylist = {
    //         id: 'new',
    //         name: newMergePlaylistName,
    //     }

    //     setPlaylists([...playlists, newPlaylist]);
    //     selectedPlaylists.push(newPlaylist);
    //     setSongs((prevSongs) => {
    //         const mergedSongs = deduplicate(selectedPlaylists.map((playlist) => songs[playlist.id] || []).flat());
    //         let idx = 0;
    //         const updatedSongs = {
    //             ...prevSongs,
    //             [newPlaylist.id]: mergedSongs.map((item) => ({
    //                 name: item.name,
    //                 artist: item.artist,
    //                 duration: item.duration,
    //                 uri: item.uri,
    //                 index: idx++
    //             }))
    //         };
    //         return updatedSongs;
    //     });
    // }

    // const intersectPlaylists = () => {
    //     const newPlaylist = {
    //         id: 'new',
    //         name: newIntersectPlaylistName,
    //     }

    //     setPlaylists([...playlists, newPlaylist]);
    //     selectedPlaylists.push(newPlaylist);
    //     setSongs((prevSongs) => {
    //         let idx = 0;
    //         const updatedSongs = {
    //             ...prevSongs,
    //             [newPlaylist.id]: repeats.map((item) => ({
    //                 name: item.name,
    //                 artist: item.artist,
    //                 duration: item.duration,
    //                 uri: item.uri,
    //                 index: idx++
    //             }))
    //         };
    //         return updatedSongs;
    //     });
    // }

    // const diffPlaylists = () => {
    //     const newPlaylist = {
    //         id: 'new',
    //         name: newDiffPlaylistName,
    //     }

    //     setPlaylists((prevPlaylists) => {
    //         const updatedPlaylists = [...prevPlaylists, newPlaylist];
    //         setSelectedPlaylists([...selectedPlaylists, newPlaylist]);
    //         return updatedPlaylists;
    //     });

    //     setSongs((prevSongs) => {
    //         let idx = 0;
    //         let mergedSongs = [];
    //         let flag = true;
    //         selectedPlaylists.forEach((playlist) => {
    //             if (flag) {
    //                 mergedSongs = deduplicate(songs[playlist.id] || []);
    //                 flag = false;
    //             }
    //             else {
    //                 mergedSongs = mergedSongs.filter(song => !songs[playlist.id].some(s => s.name === song.name && s.artist === song.artist));
    //             }
    //         });
    //         const updatedSongs = {
    //             ...prevSongs,
    //             [newPlaylist.id]: mergedSongs.map((item) => ({
    //                 name: item.name,
    //                 artist: item.artist,
    //                 duration: item.duration,
    //                 uri: item.uri,
    //                 index: idx++
    //             }))
    //         };
    //         return updatedSongs;
    //     });
    // }
    return (
        <div className="navigator-container">
            {/* Left Panel */}
            <div className="left-panel">
                <FilterBox filterText={filterText} setFilterText={setFilterText} />
                <PlaylistSection playlists={playlists} selectedPlaylists={selectedPlaylists} togglePlaylistSelection={togglePlaylistSelection} />
                <SongsSection songs={filteredSongs} selectedSong={selectedSong} selectSong={selectSong} repeats={repeats} />
            </div>

            {/* Right Panel */}
            <div className="right-panel">
                {selectedPlaylists.map((playlist) => (
                    <PlaylistDetails key={playlist.id} playlist={playlist} songs={songs[playlist.id]} repeats={repeats} selectedSong={selectedSong} setSelectedSong={setSelectedSong} setSongs={setSongs} songRefs={songRefs} />
                    // <div
                    //     key={playlist.id}
                    //     className={`playlist-details ${songs[playlist.id]?.some(song => selectedSong?.name === song.name && selectedSong?.artist === song.artist) ? 'selected' : ''}`}
                    //     onDragOver={(e) => e.preventDefault()}
                    //     onDrop={(e) => handleDrop(e, playlist.id)}
                    // >
                    //     <h3>{playlist.name}
                    //         <span className="info count">{songs[playlist.id]?.length} songs</span>
                    //         <span className="info length">{Math.round(songs[playlist.id]?.map(i => i.duration).reduce((acc, d) => acc + d, 0)/36)/100} hours</span>
                    //     </h3>
                    //     <ul className="song-details">
                    //         {songs[playlist.id]?.map((song, index) => (
                    //             <li key={index}
                    //                 className={`song-detail-item ${repeats.some(r => r.name === song.name && r.artist === song.artist) ? 'repeat' : ''} ${selectedSong?.name === song.name && selectedSong?.artist === song.artist ? 'selected' : ''}`}
                    //                 ref={(el) => (songRefs.current[song.name] = el)}
                    //                 draggable="true"
                    //                 data-index={index}
                    //                 onDragStart={(e) => handleDragStart(e, song, playlist.id)}
                    //                 onDragOver={(e) => e.preventDefault()}
                    //                 onDrop={(e) => handleDrop(e, playlist.id)}
                    //             >
                    //                 <div className="song-index">{song.index+1}</div>
                    //                 <div className="song-name">{song.name}</div>
                    //                 <div className="song-artist">{song.artist}</div>
                    //                 <div className="song-duration">{Math.floor(song.duration / 60)}:{Math.floor(song.duration % 60).toString().padStart(2, '0')}</div>
                    //                 <div className="delete-icon"
                    //                 onClick={() => handleDelete(playlist.id, song)}>🗑️</div>
                    //             </li>
                    //         ))}
                    //     </ul>
                    // </div>
                ))}
                {/* <div>
                    <div
                        key="merge"
                        className={`playlist-details merge ${selectedPlaylists.length > 1 ? "" : "disabled"}`}
                        disabled={selectedPlaylists.length > 1 ? false : true}
                    >
                        <h3>Merge Playlists</h3>
                        <div>
                            Creates a new playlist with the union of songs from the selected playlists:
                            <input type="text" placeholder="New Playlist Name" value={newMergePlaylistName} onChange={(e) => setNewMergePlaylistName(e.target.value) }/>
                            <button
                                className="merge-button"
                                disabled={newMergePlaylistName !== "" ? false : true}
                                onClick={mergePlaylists}
                            >Merge
                            </button>
                        </div>
                    </div>
                    <div
                        key="intersection"
                        className={`playlist-details merge ${selectedPlaylists.length > 1 ? "" : "disabled"}`}
                    >
                        <h3>Intersection</h3>
                        <div>
                            Creates a new playlist with the songs that appear in all selected playlists:
                            <input type="text" placeholder="New Playlist Name" value={newIntersectPlaylistName} onChange={(e) => setNewIntersectPlaylistName(e.target.value) }/>
                            <button
                                className="merge-button"
                                disabled={newIntersectPlaylistName || repeats.length == 0 ? false : true}
                                onClick={intersectPlaylists}
                            >Create
                            </button>
                        </div>
                    </div>
                    <div
                        key="diff"
                        className={`playlist-details merge ${selectedPlaylists.length > 1 ? "" : "disabled"}`}
                    >
                        <h3>Diff</h3>
                        <div>
                            Creates a new playlist with the songs that appear only in the leftmost selected playlist(s):
                            <input type="text" placeholder="New Playlist Name" value={newDiffPlaylistName} onChange={(e) => setNewDiffPlaylistName(e.target.value) }/>
                            <button
                                className="merge-button"
                                disabled={newDiffPlaylistName ? false : true}
                                onClick={diffPlaylists}
                            >Diff
                            </button>
                        </div>
                    </div>
                </div> */}
                <PlaylistActions selectedPlaylists={selectedPlaylists} playlists={playlists} setPlaylists={setPlaylists} songs={songs} setSongs={setSongs} actionPlaylistName={newPlaylistName} setActionPlaylistName={setNewPlaylistName} setSelectedPlaylists={setSelectedPlaylists} />
            </div>
        </div>
    );
};

export default Navigator;
