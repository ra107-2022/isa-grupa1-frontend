import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AllVideoInfo, VideoService } from '../../services/video-service/video.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { AuthService } from '../../infrastructure/auth/auth.service';
import { User } from '../../infrastructure/auth/model/user.model';
import { ActivityType } from '../model/activity-type.enum';
import { ActivityService } from '../activity.service';
import { CommentDto } from 'src/app/infrastructure/auth/model/comment.model';
import { CommentService } from 'src/app/infrastructure/auth/service/comment.service';
import { GeolocService } from 'src/app/services/geoloc-service/geoloc.service';


@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  user: User | undefined;

  videoId: number = 0;
  video: AllVideoInfo | null = null;
  videoUrl: SafeResourceUrl | null = null;
  loading: boolean = true;
  error: string | null = '';

  isPlaying: boolean = false;
  isLive: boolean = false;
  currentTime: number = 0;
  duration: number = 0;
  volume: number = 1;
  isMuted: boolean = false;
  isFullscreen: boolean = false;
  initialOffset: number = 0;

  showCountdown: boolean = false;
  countdownText: string = '';
  private countdownTimerId: ReturnType<typeof setInterval> | null = null;

  isAuthenticated: boolean = false;
  currentUserId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoService: VideoService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private activityService: ActivityService,
    private geolocService: GeolocService
    
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });

    this.videoId = parseInt(this.route.snapshot.paramMap.get('id') ?? 'NaN', 10);

    if (!this.videoId || Number.isNaN(this.videoId)) {
      this.router.navigate(['/home']);
    }

    this.authService.user$.subscribe(user => {
        this.isAuthenticated = !!user && user.id !== 0;
        this.currentUserId = user?.id ?? 0;
    });
    this.authService.checkIfUserExists();

    this.videoService.addView(this.videoId, this.user !== undefined && this.user.id !== 0).subscribe({
      next: info => { 
        console.log(info);
        this.geolocService.getCurrentLocation().subscribe(pos => {
          this.activityService.logActivity(this.videoId, ActivityType.VIEW, pos.longitude, pos.latitude);
        });
      },
      error: err => { console.error('Error happened: ', err); }
    });

    this.loadVideo(this.videoId);
  }

  loadVideo(id: number) {
  this.loading = true;

  this.videoService.getAllVideoInfo(id).subscribe({
    next: (info) => {
      this.video = this.normalizePremiereDate(info);
      
        if (this.video.premiereDate) {
        this.videoService.getStreamingInfo(id).subscribe(streamInfo => {
          if (!streamInfo.isAvailable) {
            this.showCountdown = true;
            this.setupVideoCountdown();
          } else {
            this.showCountdown = false;
            this.isLive = streamInfo.isLive;
            
            this.initialOffset = streamInfo.offset;
          }
        });
      }
      this.videoUrl = this.videoService.getVideoUrl(id);
      this.loading = false;
    },
    error: (err) => { /* error handling */ }
  });
}

  private normalizePremiereDate(info: AllVideoInfo): AllVideoInfo {
    const rawDate = (info as any).premiereDate ?? (info as any).premiere_date;
    if (!rawDate) {
      return info;
    }

    const parsedDate = rawDate instanceof Date ? rawDate : new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      return info;
    }

    return {
      ...info,
      premiereDate: parsedDate,
    };
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

  checkPremiereStatus(): void {
    if (!this.video?.premiereDate) {
      this.isLive = false;
      console.log('No premiere date, treating as regular video');
      console.log('Video info:', this.video);
      return;
    }

    const now = new Date();
    const timeDiffMs = this.video.premiereDate.getTime() - now.getTime();

    if (timeDiffMs <= 0) {
      this.isLive = true;
      this.syncVideo(false);
    }
  }

  syncVideo(initial: Boolean): void {
    if (!this.videoElement?.nativeElement || this.initialOffset === undefined) return;

    const video = this.videoElement.nativeElement;

    if (!initial) {
      this.videoService.getStreamingInfo(this.videoId).subscribe(streamInfo => {
        this.initialOffset = streamInfo.offset;
        if (this.initialOffset === 0) {
          this.isLive = false;
        }

        if (this.isLive) {
          video.currentTime = this.initialOffset;
          video.play();
        } 
        else {
          video.currentTime = 0; 
        }
      });
    } else {
      if (this.isLive) {
        video.currentTime = this.initialOffset;
        video.play();
      } 
      else {
        video.currentTime = 0; 
      }
    }
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

  get premiereDateString(): string | null {
    if (!this.video?.premiereDate) {
      return null;
    }
    return this.video.premiereDate.toISOString();
  }

  setupVideoCountdown() {
    if (!this.video || !this.video.premiereDate) return;
    this.clearCountdown();

    const premiereDate = this.video.premiereDate;
    const now = Date.now();
    if (premiereDate.getTime() <= now) {
      this.showCountdown = false;
      return;
    }

    this.showCountdown = true;
    this.updateCountdown();
    this.countdownTimerId = setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown() {
    if (!this.video || !this.video.premiereDate) return;
    const premiereDate = this.video.premiereDate;

    const remaining = premiereDate.getTime() - Date.now();
    if (remaining <= 0) {
      this.clearCountdown();
      this.isLive = true;
      return;
    }

    const seconds = Math.floor(remaining / 1000) % 60;
    const minutes = Math.floor(remaining / (1000 * 60)) % 60;
    const hours = Math.floor(remaining / (1000 * 60 * 60)) % 24;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));

    const pad = (value: number) => value.toString().padStart(2, '0');
    this.countdownText = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  clearCountdown() {
    if (this.countdownTimerId !== null) {
      clearInterval(this.countdownTimerId);
      this.countdownTimerId = null;
    }
    this.showCountdown = false;
    this.countdownText = '';
  }

  formatDateTime(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return typeof value === 'string' ? value : '';
    }
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onTimeUpdate(event: any) {
    this.currentTime = event.target.currentTime;
    this.duration = event.target.duration;
  }

  onPlayPause(event: any) {
    this.isPlaying = !event.target.paused;
  }

  ngOnDestroy() {
    this.clearCountdown();
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  togglePlay() {
    const video = this.videoElement.nativeElement;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  toggleMute() {
    const video = this.videoElement.nativeElement;
    this.isMuted = !this.isMuted;
    video.muted = this.isMuted;
  }

  toggleFullscreen() {
    const wrapper = document.querySelector('.video-player-wrapper');
    if (!document.fullscreenElement) {
      wrapper?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  isBehind(): boolean {
    if (!this.video?.premiereDate || !this.videoElement) return false;
    
    const now = new Date().getTime();
    const startTime = this.video.premiereDate.getTime();
    const expectedOffset = (now - startTime) / 1000;
    const actualTime = this.videoElement.nativeElement.currentTime;

    return (expectedOffset - actualTime) > 5 && this.isLive;
  }
}
