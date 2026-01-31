import { Component, Input, OnInit } from '@angular/core';
import { RatingsService } from '../ratings.service';
import { ActivityService } from '../activity.service';
import { ActivityType } from '../model/activity-type.enum';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { GeolocService } from 'src/app/services/geoloc-service/geoloc.service';

@Component({
  selector: 'app-video-rating',
  templateUrl: './ratings.component.html',
  styleUrls: ['./ratings.component.css']
})
export class RatingsComponent implements OnInit {
  @Input() videoId!: number | undefined;

  user: User | undefined;

  isLoggedIn(): boolean {
    this.authService.checkIfUserExists();
    return this.user !== undefined && this.user.id !== 0;
  }
  
  likeCount: number = 0; 
  dislikeCount: number = 0;
  userRating: string = 'NONE'; 

  constructor(private ratingsService: RatingsService,
              private activityService: ActivityService,
              private authService: AuthService,
              private geolocService: GeolocService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
    this.ratingsService.getRatingsCount(this.videoId).subscribe(counts => {
      this.likeCount = counts.likes;
      this.dislikeCount = counts.dislikes;
    });
    this.ratingsService.getUserRating(this.videoId).subscribe(userRating => {
      this.userRating = userRating.ratingType;
    });
  }

  onLike(): void {
    if (!this.isLoggedIn()) {
      alert('You must be logged in to rate videos.');
      return;
    }
    this.ratingsService.likeVideo(this.videoId).subscribe(userRating => {
      this.userRating = userRating.ratingType;
      this.ratingsService.getRatingsCount(this.videoId).subscribe(counts => {
        this.likeCount = counts.likes;
        this.dislikeCount = counts.dislikes;
        this.geolocService.getCurrentLocation().subscribe(pos => {
          this.activityService.logActivity(this.videoId, userRating.ratingType === 'LIKE' ? ActivityType.LIKE : ActivityType.NONE, pos.longitude, pos.latitude);
        });
      });
    });
  }

  onDislike(): void {
    if (!this.isLoggedIn()) {
      alert('You must be logged in to rate videos.');
      return;
    }
    this.ratingsService.dislikeVideo(this.videoId).subscribe(userRating => {
      this.userRating = userRating.ratingType;
      this.ratingsService.getRatingsCount(this.videoId).subscribe(counts => {
        this.dislikeCount = counts.dislikes;
        this.likeCount = counts.likes;
        this.geolocService.getCurrentLocation().subscribe(pos => {
          this.activityService.logActivity(this.videoId, userRating.ratingType === 'DISLIKE' ? ActivityType.DISLIKE : ActivityType.NONE, pos.longitude, pos.latitude);
        });
      });
    });
  }

  formatCount(count: number): string {
    return count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count.toString();
  }
}