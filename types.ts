
export interface Message {
  id: string;
  sender: 'user' | 'awa';
  text: string;
  timestamp: Date;
}

export type ViewState = 'intro' | 'tutorial' | 'game';

export interface GameState {
  view: ViewState;
  isLoading: boolean;
}

export enum TimeOfDay {
  MORNING = 'MORNING',
  DAY = 'DAY',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT'
}
