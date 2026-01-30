export interface VideoCard {
  id: number;
  title: string;
  creator: string;
  views: number;
  thumbnailSafeUrl?: SafeUrl;
}import { SafeUrl } from '@angular/platform-browser';