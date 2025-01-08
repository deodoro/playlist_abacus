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

export const playSong = async (songUri, activeDeviceId) => {
    const token = await getToken();

    if (!activeDeviceId) {
      throw new Error("No active device selected");
    }

    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${activeDeviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [songUri],
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to play song: ${response.status}`);
    }

    return "Song is playing";
  };

// Fetch user profile from Spotify
export const getUserProfile = async () => {
  const token = await getToken();
  const response = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.status}`);
  }

  const data = await response.json();
  return {
    name: data.display_name,
    email: data.email,
    picture: data.images.length > 0 ? data.images[0].url : null,
  };
};

// Fetch available devices and active device from Spotify
export const getAvailableDevices = async () => {
  const token = await getToken();
  const response = await fetch("https://api.spotify.com/v1/me/player/devices", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch devices: ${response.status}`);
  }

  const data = await response.json();
  const activeDevice = data.devices.find((device) => device.is_active);

  return {
    devices: data.devices.map((device) => ({
      id: device.id,
      name: device.name,
    })),
    activeDeviceId: activeDevice ? activeDevice.id : "",
  };
};

// Set the active device on Spotify
export const setActiveDevice = async (deviceId) => {
  const token = await getToken();
  const response = await fetch("https://api.spotify.com/v1/me/player", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      device_ids: [deviceId], // Array of device IDs to set as active
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to set active device: ${response.status}`);
  }

  return "Active device set successfully";
};

export const pollSpotifyState = async () => {
    const token = await getToken();
    const response = await fetch("https://api.spotify.com/v1/me/player", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        if (response.status === 204) {
            // No content means nothing is playing
            return { uri: null, position: null };
        }
        throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.is_playing && data.item) {
        return {
            uri: data.item.uri,
            position: data.progress_ms,
        };
    }

    return { uri: null, position: null };
};
