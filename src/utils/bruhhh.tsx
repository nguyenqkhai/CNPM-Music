// export async function getMusicList(): Promise<Array<{
//     image: string;
//     name: string;
//     artists: string;
//     preview_url: string | null;
//     id: string; 
//   }> | null> {
//     const url =
//       'https://api.spotify.com/v1/playlists/37i9dQZEVXbKZyn1mKjmIl/tracks';
  
//     if (!controlToken) {
//       controlToken = await getToken();
//       if (!controlToken) return null;
//     }
  
//     const headers = getAuthHeader(controlToken);
  
//     try {
//       const response = await axios.get(url, { headers });
//       if (response.status !== 200) {
//         console.error(
//           'Error fetching top trending tracks:',
//           response.status,
//           response.statusText
//         );
//         return null;
//       }
  
//       const tracksData = response.data.items;
//       const tracks = tracksData.ma  p((item: { track: Track }) => {
//         const track = item.track;
//         const trackName = track.name;
//         const artists = track.artists
//           .map((artist: Artist) => artist.name)
//           .join(', ');
//         const previewUrl = track.preview_url;
//         const image =
//           track.album.images.length > 0 ? track.album.images[0].url : '';
//         const trackId = track.id; 
  
//         return {
//           name: trackName,
//           artists,
//           preview_url: previewUrl,
//           image,
//           id: trackId, 
//         };
//       });
//       return tracks;
//     } catch (error) {
//       console.error('Error fetching top trending tracks:', error);
//       return null;
//     }
//   }