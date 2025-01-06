import {
    removeSongFromPlaylist,
    moveTrackInPlaylist,
    deleteList,
    createPlaylist,
    addSongsToPlaylist,
    fetchPlaylists,
  } from './api';
  import Operations from './operations';

  // Apply changes based on the steps
  export const applyChanges = async (steps, setSteps) => {
    for (const step of steps) {
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
          console.log(
            `MOVE ${song.uri} in ${playlistId} from ${fromIndex} to ${toIndex}`
          );
          await moveTrackInPlaylist(playlistId, fromIndex, toIndex);
          break;
        }
        case Operations.OP_DELETE_PLAYLIST: {
          console.log(`DELETE LIST ${step.playlist.id}`);
          await deleteList(step.playlist.id);
          break;
        }
        case Operations.OP_NEW_PLAYLIST: {
          const { playlist, uris } = step;
          const newPlaylist = await createPlaylist(playlist.name);
          await addSongsToPlaylist(newPlaylist.id, uris);
          break;
        }
      }
    }
    setSteps([]);
  };

  // Revert changes by resetting the state
  export const revertChanges = (setSteps, setSelectedPlaylists, setRepeats, setSongs, setPlaylists) => {
    setSteps([]);
    setSelectedPlaylists([]);
    setRepeats([]);
    setSongs({});
    fetchPlaylists()
      .then((data) =>
        setPlaylists(
          data.items.map((playlist) => ({
            id: playlist.id,
            name: playlist.name,
          }))
        )
      )
      .catch(console.error);
  };

  // Undo the last transaction
  export const undoLastChange = (steps, setSteps, setSongs, setPlaylists) => {
    if (steps.length === 0) return;

    const tId = steps[steps.length - 1].tId;
    const stepsToUndo = [];

    // Collect steps for the current transaction
    for (let i = steps.length - 1; i >= 0 && steps[i].tId === tId; i--) {
      stepsToUndo.unshift(steps.pop());
    }

    setSongs((prevSongs) => {
      const updatedSongs = { ...prevSongs };

      stepsToUndo.forEach((step) => {
        switch (step.op) {
          case Operations.OP_INSERT:
            updatedSongs[step.playlistId].splice(step.index + 1, 1);
            reindexSongs(updatedSongs[step.playlistId]);
            break;

          case Operations.OP_REMOVE:
            updatedSongs[step.playlistId].splice(step.index, 0, step.song);
            reindexSongs(updatedSongs[step.playlistId]);
            break;

          case Operations.OP_MOVE: {
            const movedSongs = [...updatedSongs[step.playlistId]];
            const [movedSong] = movedSongs.splice(step.toIndex - 1, 1);
            movedSongs.splice(step.fromIndex, 0, movedSong);
            reindexSongs(movedSongs);
            updatedSongs[step.playlistId] = movedSongs;
            break;
          }

          default:
            break;
        }
      });

      return updatedSongs;
    });

    setPlaylists((prevPlaylists) => {
      let updatedPlaylists = [...prevPlaylists];

      stepsToUndo.forEach((step) => {
        switch (step.op) {
          case Operations.OP_NEW_PLAYLIST:
            updatedPlaylists = updatedPlaylists.filter(
              (p) => p.id !== step.playlist.id
            );
            break;

          case Operations.OP_DELETE_PLAYLIST:
            updatedPlaylists.push(step.playlist);
            break;

          default:
            break;
        }
      });

      return updatedPlaylists;
    });
  };

  // Helper function to reindex songs
  const reindexSongs = (playlistSongs) => {
    playlistSongs.forEach((song, index) => {
      song.index = index;
    });
  };
