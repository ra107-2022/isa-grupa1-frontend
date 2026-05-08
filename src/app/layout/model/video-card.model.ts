export interface VideoCard {
  id: number;
  title: string;
  creator: string;
  views: number;
  duration: number;
  isLive: boolean;
  premiereDate?: Date;
  thumbnailSafeUrl?: SafeUrl;
}import { SafeUrl } from '@angular/platform-browser';
