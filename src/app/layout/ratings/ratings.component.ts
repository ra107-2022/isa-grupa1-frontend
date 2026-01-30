import { Component, Input, OnInit } from '@angular/core';
import { RatingsService } from '../ratings.service';
import { ActivityService } from '../activity.service';
import { ActivityType } from '../model/activity-type.enum';

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

  constructor(private ratingsService: RatingsService,
              private activityService: ActivityService
  ) {}

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
        this.activityService.logActivity(this.videoId, userRating.ratingType === 'LIKE' ? ActivityType.LIKE : ActivityType.NONE, 0, 0);
      });
    });
  }

  onDislike(): void {
    this.ratingsService.dislikeVideo(this.videoId).subscribe(userRating => {
      this.userRating = userRating.ratingType;
      this.ratingsService.getRatingsCount(this.videoId).subscribe(counts => {
        this.dislikeCount = counts.dislikes;
        this.likeCount = counts.likes;
        this.activityService.logActivity(this.videoId, userRating.ratingType === 'DISLIKE' ? ActivityType.DISLIKE : ActivityType.NONE, 0, 0);
      });
    });
  }

  formatCount(count: number): string {
    return count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count.toString();
  }
}