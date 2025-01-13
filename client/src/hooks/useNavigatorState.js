import { useState, useEffect } from 'react'
import { fetchPlaylists, fetchSongs } from '../utils/api'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

const useNavigatorState = () => {
   const [playlists, setPlaylists] = useState([])
   const [songs, setSongs] = useState({})
   const [selectedPlaylists, setSelectedPlaylists] = useState([])
   const [steps, setSteps] = useState([])
   const navigate = useNavigate()

   useEffect(() => {
      const loadPlaylists = async () => {
         try {
            const data = await fetchPlaylists() // Now returns an array
            setPlaylists(
               data.map((playlist) => ({
                  id: playlist.id,
                  name: playlist.name,
                  track_count: playlist.tracks.total,
               }))
            )
         } catch (err) {
            if (err.name === 'UnauthorizedError') {
               navigate('/') // Redirect on unauthorized
            } else {
               console.error('Failed to fetch playlists:', err)
            }
         }
      }

      loadPlaylists()
   }, [navigate])

   const fetchPlaylistSongs = (playlistId) => {
      return fetchSongs(playlistId)
         .then((data) => {
            let idx = 0
            const items = data.map((item) => ({
               name: item.track.name,
               artist: item.track.artists
                  .map((artist) => artist.name)
                  .join(', '),
               duration: item.track.duration_ms / 1000,
               uri: item.track.uri,
               index: idx++,
               image: item.track.album.images?.[0]?.url || null, // Select the best image
            }))

            setSongs((prev) => ({ ...prev, [playlistId]: items }))
         })
         .catch((err) => {
            if (err.name === 'UnauthorizedError') {
               navigate('/')
            } else {
               console.error('Failed to fetch playlist songs:', err)
            }
         })
   }

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
   }
}

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
}

export default useNavigatorState
