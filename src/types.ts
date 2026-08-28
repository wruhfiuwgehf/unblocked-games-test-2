export type GameCategory = 
  | 'All'
  | 'Action'
  | 'Arcade'
  | 'Puzzle'
  | 'Retro'
  | 'Casual'
  | 'Sports'
  | 'Strategy';

export interface GameControl {
  key: string;
  action: string;
}

export interface GameItem {
  id: string;
  title: string;
  category: GameCategory;
  description: string;
  thumbnail: string;
  badge?: string;
  rating: number;
  plays: number;
  featured?: boolean;
  iframeUrl?: string;
  iframeHtml?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto';
  controls: GameControl[];
  tags: string[];
  author?: string;
  isCustom?: boolean;
}

export interface CloakPreset {
  id: string;
  name: string;
  title: string;
  icon: string;
}
