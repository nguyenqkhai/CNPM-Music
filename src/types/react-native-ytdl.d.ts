declare module 'react-native-ytdl' {
    export interface Format {
      url: string;
      bitrate?: number;
    }
  
    export interface Info {
      formats: Format[];
    }
  
    export function getInfo(url: string): Promise<Info>;
    export function filterFormats(formats: Format[], type: string): Format[];
  }
  