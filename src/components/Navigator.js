import React, { useState, useEffect, useRef } from 'react'
import './Navigator.css'
import FilterBox from './FilterBox'
import useNavigatorState from '../hooks/useNavigatorState'
import { deduplicate, findRepeats } from '../utils/helpers'
import PlaylistSection from './PlaylistSection'
import SongsSection from './SongsSection'
import PlaylistDetails from './PlaylistDetails'
import PlaylistActions from './PlaylistActions'
import { fetchPlaylists, createPlaylist, addSongsToPlaylist, deleteList, removeSongFromPlaylist, moveTrackInPlaylist } from '../utils/api'
import Operations from '../utils/operations'

const Navigator = () => {
  const {
    playlists,
    setPlaylists,
    songs,
    setSongs,
    selectedPlaylists,
    setSelectedPlaylists,
    fetchPlaylistSongs,
    steps,
    setSteps
  } = useNavigatorState()

  const [selectedSong, setSelectedSong] = useState(null)
  const [filterText, setFilterText] = useState('')
  const [repeats, setRepeats] = useState([])
  const songRefs = useRef({})
  const [newPlaylistName, setNewPlaylistName] = useState('')

  useEffect(() => {
    if (selectedPlaylists.length > 0) {
      setRepeats(findRepeats(songs, selectedPlaylists))
    } else {
      setRepeats([])
    }
  }, [selectedPlaylists, songs])

  const togglePlaylistSelection = (playlist) => {
    if (selectedPlaylists.some((p) => p.id === playlist.id)) {
      setSelectedPlaylists(
        selectedPlaylists.filter((p) => p.id !== playlist.id)
      )
    } else {
      setSelectedPlaylists([...selectedPlaylists, playlist])
      if (!(playlist.id in songs)) fetchPlaylistSongs(playlist.id)
    }
  }

  const selectSong = (song) => {
    setSelectedSong(song)
    if (songRefs.current[song.uri]) {
      songRefs.current[song.uri].forEach((ref) => {
        if (ref) {
          ref.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }
      })
    }
  }

  const allSongsFromSelectedPlaylists = deduplicate(
    selectedPlaylists.map((playlist) => songs[playlist.id] || []).flat()
  )

  const filteredSongs = allSongsFromSelectedPlaylists.filter(
    (song) =>
      song.name.toLowerCase().includes(filterText.toLowerCase()) ||
      song.artist.toLowerCase().includes(filterText.toLowerCase())
  )

  const isDirty = () => steps.length > 0;

  const applyChanges = async () => {
    for(const step of steps) {
        switch (step.op) {
            case Operations.OP_INSERT: {
                const { song, playlistId, index } = step;
                console.log(`ADD ${song.uri} to ${playlistId} at ${index}`);
                break;
            }
            case Operations.OP_REMOVE: {
                const { song, playlistId } = step;
                console.log(`DELETE ${song.uri} from ${playlistId}`);
                await removeSongFromPlaylist(playlistId, song.uri);
                break;
            }
            case Operations.OP_MOVE: {
                const { song, playlistId, fromIndex, toIndex } = step;
                console.log(`MOVE ${song.uri} in ${playlistId} from ${fromIndex} to ${toIndex}`);
                await moveTrackInPlaylist(playlistId, fromIndex, toIndex);
                break;
            }
            case Operations.OP_DELETE_PLAYLIST: {
                console.log(`DELETE LIST ${step.playlistId}`);
                await deleteList(step.playlistId);
                break;
            }
            case Operations.OP_NEW_PLAYLIST: {
                const {playlist, uris} = step;
                const newPlaylist = await createPlaylist(playlist.name);
                await addSongsToPlaylist(newPlaylist.id, uris);
                break;
            }
        }
    }
    revertChanges();
  };

  const revertChanges = () => {
    setSteps([]);
    setSelectedPlaylists([]);
    setRepeats([]);
    fetchPlaylists().then((data) =>
        setPlaylists(data.items.map((playlist) => ({
            id: playlist.id,
            name: playlist.name
        }))))
        .catch(console.error);
    };

  return (
    <div className='navigator-container'>
      {/* Left Panel */}
      <div className='left-panel'>
        <FilterBox filterText={filterText} setFilterText={setFilterText} />
        <PlaylistSection
          playlists={playlists}
          selectedPlaylists={selectedPlaylists}
          togglePlaylistSelection={togglePlaylistSelection}
          deselectAllPlaylists={() => setSelectedPlaylists([])}
        />
        <SongsSection
          songs={filteredSongs}
          selectedSong={selectedSong}
          selectSong={selectSong}
          repeats={repeats}
          songRefs={songRefs}
        />
        {isDirty() && (
        <div className='bottom-panel'>
            <h3>{steps.length} change{steps.length > 1 ? 's':''} to be applied</h3>
            <div>
                <button onClick={applyChanges}>Apply</button>
                <button onClick={revertChanges}>Revert</button>
            </div>
        </div>
        )}
      </div>

      <div className='right-panel'>
        {selectedPlaylists.map((playlist) => (
          <PlaylistDetails
            key={playlist.id}
            playlist={playlist}
            setPlaylists={setPlaylists}
            songs={songs[playlist.id]}
            repeats={repeats}
            selectedSong={selectedSong}
            setSelectedSong={selectSong}
            setSongs={setSongs}
            songRefs={songRefs}
            setSteps={setSteps}
            setSelectedPlaylists={setSelectedPlaylists}
          />
        ))}
        <PlaylistActions
          selectedPlaylists={selectedPlaylists}
          playlists={playlists}
          setPlaylists={setPlaylists}
          songs={songs}
          setSongs={setSongs}
          actionPlaylistName={newPlaylistName}
          setActionPlaylistName={setNewPlaylistName}
          setSelectedPlaylists={setSelectedPlaylists}
        />
      </div>
    </div>
  )
}

export default Navigator
