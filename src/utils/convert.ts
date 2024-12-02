import ytdl from 'react-native-ytdl';

export async function getAudioUrl(videoUrl: string): Promise<string | null> {
    try {
        const info = await ytdl.getInfo(videoUrl);
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

        if (!audioFormats || audioFormats.length === 0) {
            console.log('No audio formats found');
            return null;
        }

        // Đảm bảo TypeScript biết `a` và `b` là kiểu Format
        const bestAudio = audioFormats.sort((a: ytdl.Format, b: ytdl.Format) => {
            const bitrateA = a.bitrate ?? 0;
            const bitrateB = b.bitrate ?? 0;
            return bitrateB - bitrateA;
        })[0];

        const audioUrl = bestAudio.url;
        if (audioUrl) {
            console.log(`${videoUrl} Audio url: ${audioUrl}`);
            return audioUrl;
        } else {
            console.log('No valid audio URL found');
            return null;
        }
    } catch (error) {
        console.log('Lỗi khi lấy audio url: ', error);
        throw error;
    }
}
