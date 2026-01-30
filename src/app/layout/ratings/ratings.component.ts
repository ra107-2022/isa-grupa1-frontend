import { Component, Input, OnInit } from '@angular/core';
import { RatingsService } from '../ratings.service';

@Component({
  selector: 'app-video-rating',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.css']
})
export class RatingsComponent implements OnInit {
  @Input() videoId!: number | undefined;
  
  // These would ideally come from your /couts (counts) endpoint
  likeCount: number = 0; 
  dislikeCount: number = 0;
  userRating: string = 'NONE'; // 1 for like, -1 for dislike, 0 for none

  constructor(private ratingsService: RatingsService) {}

  ngOnInit(): void {
    this.ratingsService.getRatingsCount(this.videoId).subscribe(counts => {
      this.likeCount = counts.likes;
      this.dislikeCount = counts.dislikes;
    });
    this.ratingsService.getUserRating(this.videoId).subscribe(userRating => {
      this.userRating = userRating.ratingType;
    });
  }

  onLike(): void {
    this.ratingsService.likeVideo(this.videoId).subscribe(userRating => {
      this.userRating = userRating.ratingType;
      this.ratingsService.getRatingsCount(this.videoId).subscribe(counts => {
        this.likeCount = counts.likes;
        this.dislikeCount = counts.dislikes;
      });
    });
  }

  onDislike(): void {
    this.ratingsService.dislikeVideo(this.videoId).subscribe(userRating => {
      this.userRating = userRating.ratingType;
      this.ratingsService.getRatingsCount(this.videoId).subscribe(counts => {
        this.dislikeCount = counts.dislikes;
        this.likeCount = counts.likes;
      });
    });
  }

  formatCount(count: number): string {
    return count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count.toString();
  }
}