import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HomeService } from '../home.service';
import { VideoCard } from '../model/video-card.model';
import { ActivityService } from '../activity.service';
import { forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  thumbnailUrl: SafeUrl | undefined;
  videos: VideoCard[] = [];

  constructor(private homeService: HomeService,
              private sanitizer: DomSanitizer,
              private router: Router,
              private activityService: ActivityService
  ) { }

  showLocalTrendingVideos() {
    this.activityService.getTrendingVideos(20, 20, 10000, 10).pipe(
      switchMap(videoIds => {
      if (!videoIds || videoIds.length === 0) {
        return of([]);
      }

      const requests = videoIds.map(videoId =>
        forkJoin({
          info: this.homeService.getVideoInfo(videoId),
          thumbnail: this.homeService.getThumbnail(videoId)
        }).pipe(
          map(res => {
            const objectURL = URL.createObjectURL(res.thumbnail);
            return {
              id: videoId,
              title: res.info.title,
              creator: res.info.userUsername,
              views: res.info.viewCount,
              thumbnailSafeUrl: this.sanitizer.bypassSecurityTrustUrl(objectURL)
            } as VideoCard;
          })
        )
      );
      // forkJoin ovde garantuje da će rezultati biti u istom redosledu kao i 'requests' niz
      return forkJoin(requests);
    })
  ).subscribe({
    next: (orderedVideos) => {
      this.videos = orderedVideos;
    },
    error: (err) => console.error('Greška pri učitavanju:', err)
  });
  }

  ngOnInit() {
    this.loadVideos();
  }

  loadVideos(): void {
    this.homeService.getPagedVideos(0, 10).pipe(
      switchMap(videoIds => {
        if (!videoIds || videoIds.length === 0) {
          return of([]);
        }

        const requests = videoIds.map(videoId =>
          forkJoin({
            info: this.homeService.getVideoInfo(videoId),
            thumbnail: this.homeService.getThumbnail(videoId)
          }).pipe(
            map(res => {
              const objectURL = URL.createObjectURL(res.thumbnail);
              return {
                id: videoId,
                title: res.info.title,
                creator: res.info.userUsername,
                views: res.info.viewCount,
                thumbnailSafeUrl: this.sanitizer.bypassSecurityTrustUrl(objectURL)
              } as VideoCard;
            })
          )
        );
        // forkJoin ovde garantuje da će rezultati biti u istom redosledu kao i 'requests' niz
        return forkJoin(requests);
      })
    ).subscribe({
      next: (orderedVideos) => {
        this.videos = orderedVideos;
      },
      error: (err) => console.error('Greška pri učitavanju:', err)
    });
  }

  sayHello(id: number) {
    this.router.navigate([`/video/${id}`]);
  }

  ngOnDestroy() {
    this.videos.forEach(video => {
      if (video.thumbnailSafeUrl) {
        const url = (video.thumbnailSafeUrl as any).changingThisBreaksApplicationSecurity;
        URL.revokeObjectURL(url);
      }
    });
  }
}
