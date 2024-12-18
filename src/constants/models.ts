export interface SongBase {
  id: string;
  name: string;
  artists: string;
  videoUrl: string | null;
  image: string;
  genres: string[];
}

export interface Comments {
  user: string;
  userId?: string;
  userComments: string;
  timestamp: string;
  photoUrl: string;
}

export interface Reviews {
  id: string;
  name: string;
  comments: Comments[];
}

export interface Top100 extends SongBase {}
export interface ChillList extends SongBase {}
export interface VPopList extends SongBase {}
export interface RecommnededSong extends SongBase {}
export interface Song extends SongBase {}
