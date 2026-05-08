import { Component, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-card',
  templateUrl: './video-card.component.html',
  styleUrls: ['./video-card.component.scss']
})
export class VideoCardComponent {
  @Input() thumbnailUrl!: SafeUrl | undefined;
  @Input() title!: string;
  @Input() creator!: string;
  @Input() views!: number;
  @Input() duration!: number;
  @Input() isLive!: boolean;
  @Input() premiereDate?: Date;

  formatDuration(seconds: number): string {
    if (!seconds && seconds !== 0) return '';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const hDisplay = h > 0 ? h + ':' : '';
    const mDisplay = h > 0 ? m.toString().padStart(2, '0') + ':' : m + ':';
    const sDisplay = s.toString().padStart(2, '0');

    return hDisplay + mDisplay + sDisplay;
  }

  isUpcomingPremiere(): boolean {
    if (!this.isLive && this.premiereDate) {
      const now = new Date();
      return this.premiereDate.getTime() > now.getTime();
    }
    return false;
  }
}
