import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HomeService } from '../home.service';
import { VideoCard } from '../model/video-card.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  thumbnailUrl: SafeUrl | undefined;
  videos: VideoCard[] = [];

  constructor(private homeService: HomeService,
              private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.homeService.getPagedVideos(0, 10).subscribe(videoIds => {
      videoIds.forEach(videoId => {
        this.homeService.getVideoInfo(videoId).subscribe(videoInfo => {
          let videoCard: VideoCard = {
            id: videoId,
            title: videoInfo.title,
            creator: videoInfo.userUsername,
            views: videoInfo.viewCount,
          };
          this.homeService.getThumbnail(videoId).subscribe(blob => {
            const objectURL = URL.createObjectURL(blob);
            videoCard.thumbnailSafeUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          });

          this.videos.push(videoCard);
        });
      });
    });
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
