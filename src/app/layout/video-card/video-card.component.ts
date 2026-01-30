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
}
