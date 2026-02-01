import { Component, Input, OnInit } from '@angular/core';
import { CommentService } from 'src/app/infrastructure/auth/service/comment.service';
import { CommentDto } from 'src/app/infrastructure/auth/model/comment.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivityService } from '../activity.service';
import { ActivityType } from '../model/activity-type.enum';
import { GeolocService } from 'src/app/services/geoloc-service/geoloc.service';

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.css']
})
export class CommentSectionComponent implements OnInit {

  @Input() videoId!: number;
  @Input() currentUserId!: number;
  @Input() isAuthenticated!: boolean;

  comments: CommentDto[] = [];
  newCommentText: string = '';
  editTextMap: { [key: number]: string } = {};
  currentPage: number = 0;
  totalPages: number = 1;

  constructor(private commentService: CommentService,
              private snackBar: MatSnackBar,
              private activityService: ActivityService,
              private geolocService: GeolocService
  ) {}

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.commentService.getComments(this.videoId, this.currentPage).subscribe({
      next: (page) => {
        this.comments = page.content;
        this.totalPages = page.totalPages;
        this.currentPage = page.number;
      },
      error: (err) => console.error('Error loading comments:', err)
    });
  }


  onAddComment() {
    if(!this.newCommentText.trim()) return;

    this.commentService.addComment(this.videoId, this.newCommentText.trim()).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.newCommentText = '';
        this.geolocService.getCurrentLocation().subscribe(pos => {
          this.activityService.logActivity(this.videoId, ActivityType.COMMENT, pos.longitude, pos.latitude);
        });
      },
      error: (err) => {
        console.error('Error adding comment:', err)
        console.error('Status code:', err.status);
        console.error('Error message:', err.message);
        this.snackBar.open(
          'Adding comment failed. Please try again later.',
          'OK',
          { duration: 3000,
            horizontalPosition: 'left',
            verticalPosition: 'bottom'
           }
        );
      }

    });
  }

  onEditComment(commentId: number) {
      const newContent = this.editTextMap[commentId];

      this.commentService.editComment(commentId, newContent).subscribe({
        next: () => {
          const comment = this.comments.find(c => c.commentId === commentId);
          if (comment) comment.content = newContent;
          delete this.editTextMap[commentId];
        },
        error: (err) => {
          if (err.status === 403 || err.status === 401) {
            this.snackBar.open(
              'You can not edit this comment',
              'OK',
              {
                duration: 3000,
                horizontalPosition: 'left',
                verticalPosition: 'bottom'
              }
            );
          } else {
            console.error('Error editing comment:', err);
            this.snackBar.open(
              'Something went wrong. Please try again later.',
              'OK',
              { duration: 3000 }
            );
          }
        }
      });
    }


  cancelEdit(commentId: number) {
    delete this.editTextMap[commentId];
  }

  onDeleteComment(commentId: number) {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.commentId !== commentId);
        this.snackBar.open(
          'Comment deleted successfully.',
          'OK',
          { 
            duration: 3000,
            horizontalPosition: 'left',
            verticalPosition: 'bottom'
          }
        );
      },
      error: (err) => console.error('Error deleting comment:', err)
    });
  }

  prevPage() {
    if(this.currentPage > 0) {
      this.currentPage--;
      this.loadComments();
    }
  }

  nextPage() {
    if(this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.loadComments();
    }
  }
}