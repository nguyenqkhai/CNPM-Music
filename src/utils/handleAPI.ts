import axios from 'axios';
import {Song} from '../constants/models';

// Khóa API của bạn
export const API_KEY = 'AIzaSyCNaC8i42aprcQN6FGmDqxa4EeDffhX9PY';

/**
 * Lấy dữ liệu từ playlist (1 trang duy nhất)
 * @param playlistId ID của playlist cần lấy dữ liệu
 * @param maxItems Số lượng mục tối đa cần lấy
 * @returns Mảng các bài hát
 */
async function fetchPlaylistItemsSinglePage(
  playlistId: string,
  maxItems: number = 50,
): Promise<any[]> {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxItems}&key=${API_KEY}`;
  try {
    const response = await axios.get(url);

    if (response.status !== 200) {
      console.error('Error:', response.status, response.statusText);
      return [];
    }

    const data = response.data;
    const items = data.items || [];
    return items.slice(0, maxItems);
  } catch (error) {
    console.error('Lỗi khi lấy bài hát từ playlist:', error);
    return [];
  }
}

/**
 * Hàm chính để lấy danh sách bài hát từ playlist
 * @returns Mảng các bài hát theo kiểu `Song[]`
 */
export async function getMusicList(): Promise<Song[] | null> {
  const playlistId = 'PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i';
  const maxItems = 50;

  try {
    const playlistData = await fetchPlaylistItemsSinglePage(
      playlistId,
      maxItems,
    );

    if (!playlistData || playlistData.length === 0) {
      console.log('Không có bài nhạc nào trong playlist.');
      return [];
    }

    const tracks = playlistData.map((item: {snippet: any}) => {
      const title = item.snippet.title || 'Không có tiêu đề';
      const videoId = item.snippet.resourceId?.videoId || 'unknown';
      const artistName = item.snippet.channelTitle || 'Không rõ nghệ sĩ';
      const image = item.snippet.thumbnails.high?.url || '';
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      return {
        name: title,
        artists: artistName,
        videoUrl,
        image,
        id: videoId,
      } as Song;
    });

    return tracks;
  } catch (error) {
    console.error('Lỗi khi lấy bài hát từ playlist:', error);
    return null;
  }
}

/**
 * Test thử API (có thể xóa nếu không cần)
 */
// async function fetchPlaylistData() {
//   try {
//     const response = await axios.get(
//       `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i&maxResults=50&key=${API_KEY}`,
//     );
//     console.log('Dữ liệu lấy được:', response.data);
//   } catch (error) {
//     console.error('Lỗi khi lấy dữ liệu playlist:', error);
//   }
// }

// // Test API
// fetchPlaylistData();
