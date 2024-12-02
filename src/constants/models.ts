export interface Top100 {
    image: string;
    name: string;
    artists: string;
    preview_url: string | null;
  }
  
export interface ChillList {
    image: string;
    name: string;
    artists: string;
    preview_url: string | null;
  }

export interface VPopList {
    image: string;
    name: string;
    artists: string;
    preview_url: string | null;
  }

export interface Song {
    id: string;
    name: string;
    artists: string;
    videoUrl: string | null;
    image: string;
  }
