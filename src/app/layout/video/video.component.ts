import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AllVideoInfo, VideoService } from '../../services/video-service/video.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { AuthService } from '../../infrastructure/auth/auth.service';
import { User } from '../../infrastructure/auth/model/user.model';
import { ActivityType } from '../model/activity-type.enum';
import { ActivityService } from '../activity.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {
  user: User | undefined;

  videoId: number = 0;
  video: AllVideoInfo | null = null;
  videoUrl: SafeResourceUrl | null = null;
  loading: boolean = true;
  error: string | null = '';

  isPlaying: boolean = false;
  currentTime: number = 0;
  duration: number = 0;
  volume: number = 1;
  isMuted: boolean = false;
  isFullscreen: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoService: VideoService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private activityService: ActivityService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });

    this.videoId = parseInt(this.route.snapshot.paramMap.get('id') ?? 'NaN', 10);

    if (!this.videoId || Number.isNaN(this.videoId)) {
      this.router.navigate(['/home']);
    }

    this.authService.checkIfUserExists();
    this.videoService.addView(this.videoId, this.user !== undefined && this.user.id !== 0).subscribe({
      next: info => { console.log(info); },
      error: err => { console.error('Error happened: ', err); }
    });

    this.activityService.logActivity(this.videoId, ActivityType.VIEW, 3, 3);

    this.loadVideo(this.videoId);
  }

  loadVideo(id: number) {
    this.loading = true;
    this.error = null;

    this.videoService.getAllVideoInfo(id).subscribe({
      next: (info) => {
        this.video = info;
        this.videoUrl = this.videoService.getVideoUrl(id);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading video: ', err);
        this.error = 'Failed to load video. Please try again later!';
        this.loading = false;
      }
    });
  }

  onVideoError(event: any) {
    console.error('Video playback error:', event);

    const video = event.target;
    const error = video.error;

    if (error) {
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Decode the error code
      switch (error.code) {
        case 1:
          console.error('MEDIA_ERR_ABORTED: Video loading was aborted');
          this.error = 'Video loading was aborted';
        break;
        case 2:
          console.error('MEDIA_ERR_NETWORK: Network error while loading video');
          this.error = 'Network error while loading video';
        break;
        case 3:
          console.error('MEDIA_ERR_DECODE: Video decoding failed');
          this.error = 'Video format not supported or corrupted';
        break;
        case 4:
          console.error('MEDIA_ERR_SRC_NOT_SUPPORTED: Video format not supported');
          this.error = 'Video format not supported';
        break;
        default:
          console.error('Unknown error');
          this.error = 'Unknown video error';
      }
    }

    console.log('Video src:', video.src);
    console.log('Video currentSrc:', video.currentSrc);
  }

  formatDate(dateString: string): string {
    const date =  new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  onTimeUpdate(event: any) {
    this.currentTime = event.target.currentTime;
    this.duration = event.target.duration;
  }

  onPlayPause(event: any) {
    this.isPlaying = !event.target.paused;
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
