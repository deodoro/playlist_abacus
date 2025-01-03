export const deduplicate = (songs) => {
    const sortedSongs = [...songs].sort((a, b) => {
      const nameComparison = a.name.localeCompare(b.name);
      return nameComparison !== 0 ? nameComparison : a.artist.localeCompare(b.artist);
    });
    return sortedSongs.filter(
      (song, index) =>
        index === 0 ||
        (sortedSongs[index - 1].name !== song.name &&
          sortedSongs[index - 1].artist !== song.artist)
    );
  };

  export const findRepeats = (songsByPlaylist, selectedPlaylists) => {
    let repeatsList = [];
    if (selectedPlaylists.length > 1) {
      let flag = true;
      selectedPlaylists.forEach((playlist) => {
        const playlistSongs = songsByPlaylist[playlist.id] || [];
        repeatsList = flag
          ? playlistSongs
          : repeatsList.filter((song) =>
              playlistSongs.some(
                (s) => s.uri === song.uri
              )
            );
        flag = false;
      });
    }
    return repeatsList;
  };
