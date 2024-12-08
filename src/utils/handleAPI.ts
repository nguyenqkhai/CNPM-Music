import axios from 'axios';
export const API_KEY = 'AIzaSyC_dC4q_BA06LH6mPyqDrso8K5WRXS45H4';
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
};

const EXCLUDED_KEYWORDS = ['mix', 'playlist', 'compilation', 'non-stop'];

function parseDurationISO8601(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

async function fetchVideosByKeyword(
  keyword: string,
  maxItems: number = 50,
): Promise<YouTubeSearchItem[]> {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    keyword,
  )}&type=video&maxResults=${maxItems}&key=${API_KEY}`;

  try {
    const response = await axios.get(url);

    if (response.status !== 200) {
      console.error('Error:', response.status, response.statusText);
      return [];
    }

    const data = response.data;
    const items: YouTubeSearchItem[] = data.items || [];

    const videoIds = items.map(item => item.id.videoId).join(',');
    const durationUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${API_KEY}`;
    const durationResponse = await axios.get(durationUrl);

    if (durationResponse.status !== 200) {
      console.error(
        'Error fetching video durations:',
        durationResponse.status,
        durationResponse.statusText,
      );
      return items;
    }

    const durationData = durationResponse.data.items;

    const filteredItems = items.filter((item, index) => {
      const duration = durationData[index]?.contentDetails?.duration || '';
      const durationSeconds = parseDurationISO8601(duration);

      const title = item.snippet.title.toLowerCase();
      return (
        !EXCLUDED_KEYWORDS.some(keyword => title.includes(keyword)) &&
        durationSeconds >= 120 &&
        durationSeconds <= 600
      );
    });

    return filteredItems.slice(0, maxItems);
  } catch (error) {
    console.error('Lỗi khi tìm kiếm video:', error);
    return [];
  }
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

    const tracks: Song[] = searchData.map(item => {
      const title = item.snippet.title || 'Không có tiêu đề';
      const videoId = item.id.videoId || 'unknown';
      const artistName = item.snippet.channelTitle || 'Không rõ nghệ sĩ';
      const image = item.snippet.thumbnails.high?.url || '';
      const videoUrl = `https://music.youtube.com/watch?v=${videoId}`;
      return {
        name: title,
        artists: artistName,
        videoUrl,
        image,
        id: videoId,
      };
    });

    return tracks;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài hát:', error);
    return null;
  }
}
