import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AllVideoInfo, VideoService } from '../../services/video-service/video.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { User } from '../../infrastructure/auth/model/user.model';
import { ActivityType } from '../model/activity-type.enum';
import { ActivityService } from '../activity.service';
import { ChatService, ChatMessage } from '../../services/chat-service/chat.service';
import { UserProfileService } from '../../infrastructure/auth/service/user-profile.service';
import { GeolocService } from 'src/app/services/geoloc-service/geoloc.service';
import { WatchpartyService } from 'src/app/services/watchparty-service/watchparty.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit, OnDestroy {
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
  isAvailable: boolean = true;

  showCountdown: boolean = false;
  countdownText: string = '';
  private countdownTimerId: ReturnType<typeof setInterval> | null = null;

  isAuthenticated: boolean = false;
  currentUserId: number = 0;
  chatUsername: string = '';

  messages: ChatMessage[] = [];
  newMessage: string = '';
  showChat: boolean = true;
  isPremiere: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoService: VideoService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private activityService: ActivityService,
    private geolocService: GeolocService,
    private watchpartyService: WatchpartyService,
    private chatService: ChatService,
    private userProfileService: UserProfileService
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

    this.authService.user$.subscribe(user => {
      if (user && user.id !== 0) {
        this.userProfileService.getMyProfile().subscribe(profile => {
          this.chatUsername = profile.username;
        });
      }
    });

    this.loadVideo(this.videoId);
  }

  loadVideo(id: number) {
    this.loading = true;

    this.videoService.getAllVideoInfo(id).subscribe({
      next: (info) => {
        this.video = this.normalizePremiereDate(info);

        if (this.video.premiereDate) {
          this.isPremiere = true;
          this.videoService.getStreamingInfo(id).subscribe({
            next: (streamInfo) => {
              if (!streamInfo.isAvailable) {
                this.showCountdown = true;
                this.isAvailable = false;
                this.setupVideoCountdown();
              } else {
                this.showCountdown = false;
                this.isLive = streamInfo.isLive;
                this.isAvailable = true;
                this.initialOffset = streamInfo.offset;
              }

              this.chatService.connect();
              this.chatService.getHistory(this.videoId).subscribe(history => {
                this.messages = history;
              });
              this.chatService.getMessages(this.videoId).subscribe(msg => {
                this.messages.push(msg);
              });

              if (this.isAvailable) {
                this.videoService.addView(this.videoId, this.user !== undefined && this.user.id !== 0).subscribe({
                  next: info => {
                    this.geolocService.getCurrentLocation().subscribe(pos => {
                      this.activityService.logActivity(this.videoId, ActivityType.VIEW, pos.longitude, pos.latitude);
                    });
                  },
                  error: err => { console.error('Error happened: ', err); }
                });
              }
            }
          });
        }

        this.videoUrl = this.videoService.getVideoUrl(id);
        this.loading = false;

        if(this.watchpartyService.roomCode) {
          setTimeout(() => {
            const video = this.videoElement.nativeElement;
            if(video) {
              video.muted = true;
              video.play().then(() => {
                video.muted = false;
              }).catch(err => {
                console.error('Error auto-playing video in watch party:', err);
              });
            }
          }, 500);
        }
      },
      error: (err) => {}
    });
  }

  toggleChat() {
    this.showChat = !this.showChat;
  }

  sendChatMessage() {
    if (!this.newMessage.trim() || !this.user || !this.chatUsername) return;
    this.chatService.sendMessage(this.videoId, this.chatUsername, this.newMessage.trim());
    this.newMessage = '';
  }

  private normalizePremiereDate(info: AllVideoInfo): AllVideoInfo {
    const rawDate = (info as any).premiereDate ?? (info as any).premiere_date;
    if (!rawDate) return info;
    const parsedDate = rawDate instanceof Date ? rawDate : new Date(rawDate);
    if (isNaN(parsedDate.getTime())) return info;
    return { ...info, premiereDate: parsedDate };
  }

  onVideoError(event: any) {
    const video = event.target;
    const error = video.error;
    if (error) {
      switch (error.code) {
        case 1: this.error = 'Video loading was aborted'; break;
        case 2: this.error = 'Network error while loading video'; break;
        case 3: this.error = 'Video format not supported or corrupted'; break;
        case 4: this.error = 'Video format not supported'; break;
        default: this.error = 'Unknown video error';
      }
    }
  }

  checkPremiereStatus(): void {
    if (!this.video?.premiereDate) { this.isLive = false; return; }
    const now = new Date();
    const timeDiffMs = this.video.premiereDate.getTime() - now.getTime();
    if (timeDiffMs <= 0) { this.isLive = true; this.syncVideo(false); }
  }

  syncVideo(initial: Boolean): void {
    if (!this.videoElement?.nativeElement || this.initialOffset === undefined) return;
    const video = this.videoElement.nativeElement;
    if (!initial) {
      this.videoService.getStreamingInfo(this.videoId).subscribe(streamInfo => {
        this.initialOffset = streamInfo.offset;
        if (this.initialOffset === 0) this.isLive = false;
        if (this.isLive) { video.currentTime = this.initialOffset; video.play(); }
        else { video.currentTime = 0; }
      });
    } else {
      if (this.isLive) { video.currentTime = this.initialOffset; video.play(); }
      else { video.currentTime = 0; }
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  goBack() { this.router.navigate(['/home']); }

  get premiereDateString(): string | null {
    if (!this.video?.premiereDate) return null;
    return this.video.premiereDate.toISOString();
  }

  setupVideoCountdown() {
    if (!this.video || !this.video.premiereDate) return;
    this.clearCountdown();
    const premiereDate = this.video.premiereDate;
    if (premiereDate.getTime() <= Date.now()) { this.showCountdown = false; return; }
    this.showCountdown = true;
    this.updateCountdown();
    this.countdownTimerId = setInterval(() => this.updateCountdown(), 1000);
  }

  updateCountdown() {
    if (!this.video || !this.video.premiereDate) return;
    const remaining = this.video.premiereDate.getTime() - Date.now();
    if (remaining <= 0) { this.clearCountdown(); this.isLive = true; return; }
    const pad = (v: number) => v.toString().padStart(2, '0');
    const seconds = Math.floor(remaining / 1000) % 60;
    const minutes = Math.floor(remaining / (1000 * 60)) % 60;
    const hours = Math.floor(remaining / (1000 * 60 * 60)) % 24;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    this.countdownText = `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  clearCountdown() {
    if (this.countdownTimerId !== null) { clearInterval(this.countdownTimerId); this.countdownTimerId = null; }
    this.showCountdown = false;
    this.countdownText = '';
  }

  formatDateTime(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return typeof value === 'string' ? value : '';
    return date.toLocaleString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  onTimeUpdate(event: any) { this.currentTime = event.target.currentTime; this.duration = event.target.duration; }
  onPlayPause(event: any) { this.isPlaying = !event.target.paused; }

  ngOnDestroy() {
    this.clearCountdown();
    this.chatService.disconnect();
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  togglePlay() {
    const video = this.videoElement.nativeElement;
    if (video.paused) video.play(); else video.pause();
  }

  toggleMute() {
    const video = this.videoElement.nativeElement;
    this.isMuted = !this.isMuted;
    video.muted = this.isMuted;
  }

  toggleFullscreen() {
    const wrapper = document.querySelector('.video-player-wrapper');
    if (!document.fullscreenElement) wrapper?.requestFullscreen();
    else document.exitFullscreen();
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
