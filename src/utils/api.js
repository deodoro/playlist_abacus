const getToken = async () => {
    const token = localStorage.getItem("spotifyAccessToken");
    if (token)
        return token;
    else
        document.location = "/login";
}

export const fetchPlaylists = async () => {
    const token = await getToken();
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
            Authorization: `Bearer ${token}`
        },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
};

export const fetchSongs = async (playlistId) => {
    const token = await getToken();
    const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
};

export const getUserId = async () => {
    const token = await getToken(); // Replace with your token-fetching logic
    const response = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);

    const data = await response.json();
    return data.id; // User ID
};

export const createPlaylist = async (playlistName, description = "") => {
    const token = await getToken();
    const userId = await getUserId();
    const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: playlistName,
            description: description,
            public: false, // You can change this to true if you want the playlist to be public
        }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
};

export const addSongsToPlaylist = async (playlistId, songUris) => {
    const token = await getToken();
    const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uris: songUris,
            }),
        }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
};

export const deleteList = async (playlistId) => {
    const token = await getToken(); // Replace with your token-fetching logic
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return "Playlist successfully deleted (unfollowed)";
};

export const addSongToPlaylistAtPosition = async (playlistId, songUri, position) => {
    const token = await getToken();
    const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uris: [songUri],
                position: position, // Specify the position where the song should be added
            }),
        }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
};

export const moveTrackInPlaylist = async (playlistId, sourceIndex, targetIndex) => {
    const token = await getToken();
    const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                range_start: sourceIndex,
                insert_before: targetIndex,
            }),
        }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
};

export const removeSongFromPlaylist = async (playlistId, songUri) => {
    const token = await getToken();
    const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tracks: [{
                    uri: songUri,
                }],
            }),
        }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
};
