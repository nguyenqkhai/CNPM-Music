import axios from 'axios';
import {Buffer} from 'buffer';

// Spotify API credentials
const clientId = '730e9ece26974c099f8399fb76b12916';
const clientSecret = 'a0b72df5fdad4c7fb4e6c9a496a5335f';

// YouTube Data API
export const API_KEY = 'AIzaSyCJJZaSxNng4wd3Q-2852LChLj3vX8hdK4';

type YouTubeSearchItem = {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
};

export type Song = {
  name: string;
  artists: string;
  videoUrl: string;
  image: string;
  id: string;
  genres: string[];
};

const EXCLUDED_KEYWORDS = ['mix', 'playlist', 'compilation', 'non-stop'];
const genreCache: Record<string, string[]> = {};

function parseDurationISO8601(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.response?.status === 429 && i < retries - 1) {
        console.warn(`Rate limit reached, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
}

async function getSpotifyAccessToken(): Promise<string> {
  const response = await retryRequest(() =>
    axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`,
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    ),
  );
  return response.data.access_token;
}

async function getSongGenre(songName: string): Promise<string[]> {
  if (genreCache[songName]) return genreCache[songName];

  const accessToken = await getSpotifyAccessToken();

  const searchResponse = await retryRequest(() =>
    axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        songName,
      )}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ),
  );

  if (searchResponse.data.tracks.items.length > 0) {
    const track = searchResponse.data.tracks.items[0];
    const artistId = track.artists[0].id;
    const artistResponse = await retryRequest(() =>
      axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    const genres =
      artistResponse.data.genres.length > 0
        ? artistResponse.data.genres
        : ['Unknown Genre'];
    genreCache[songName] = genres;
    return genres;
  } else {
    return ['Unknown Genre'];
  }
}

async function fetchVideosByKeyword(
  keyword: string,
  maxItems: number = 20,
): Promise<YouTubeSearchItem[]> {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    keyword,
  )}&type=video&maxResults=${maxItems}&key=${API_KEY}`;

  const response = await retryRequest(() => axios.get(url));

  const items: YouTubeSearchItem[] = response.data.items || [];
  const videoIds = items.map(item => item.id.videoId).join(',');
  const durationUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${API_KEY}`;
  const durationResponse = await retryRequest(() => axios.get(durationUrl));

  const durationData = durationResponse.data.items;

  return items.filter((item, index) => {
    const duration = durationData[index]?.contentDetails?.duration || '';
    const durationSeconds = parseDurationISO8601(duration);

    const title = item.snippet.title.toLowerCase();
    return (
      !EXCLUDED_KEYWORDS.some(keyword => title.includes(keyword)) &&
      durationSeconds >= 120 &&
      durationSeconds <= 600
    );
  });
}

export async function getMusicListByKeyword(
  keyword: string,
): Promise<Song[] | null> {
  try {
    const searchData: YouTubeSearchItem[] = await fetchVideosByKeyword(keyword);

    if (!searchData || searchData.length === 0) {
      console.log(`Không tìm thấy bài nhạc nào cho từ khóa "${keyword}".`);
      return [];
    }

    // Thực hiện song song các tác vụ
    const tracks = await Promise.all(
      searchData.map(async item => {
        const title = item.snippet.title || 'Không có tiêu đề';
        const videoId = item.id.videoId || 'unknown';
        const artistName = item.snippet.channelTitle || 'Không rõ nghệ sĩ';
        const image = item.snippet.thumbnails.high?.url || '';
        const videoUrl = `https://music.youtube.com/watch?v=${videoId}`;

        // Lấy thể loại bài hát từ Spotify
        const genres = await getSongGenre(title);

        return {
          name: title,
          artists: artistName,
          videoUrl,
          image,
          id: videoId,
          genres,
        };
      }),
    );

    return tracks;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài hát:', error);
    return null;
  }
}
