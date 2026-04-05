export interface Unlockable {
  name: string;
  xp: number;
  category: string;
  imageUrl?: string;
  unlocked?: boolean;
  xpToGo?: number;
}
