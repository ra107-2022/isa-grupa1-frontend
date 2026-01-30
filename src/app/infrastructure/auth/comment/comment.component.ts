import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommentDto } from '../model/comment.model';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnChanges {

  @Input() comments: CommentDto[] = [];
  @Input() isAuthenticated: boolean = false;
  @Input() videoId!: number; // id videa za paginaciju
  @Input() pageSize: number = 20;

  @Output() addComment = new EventEmitter<string>(); // event za FE da pozove backend
  @Output() deleteComment = new EventEmitter<number>(); // commentId
  @Output() editComment = new EventEmitter<{ commentId: number, content: string }>();
  @Output() pageChange = new EventEmitter<number>(); // FE paginacija

  newCommentText: string = '';
  editTextMap: { [key: number]: string } = {}; // mapiranje commentId na tekst za editovanje
  currentPage: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['videoId']) {
      this.currentPage = 0; // resetuj stranicu ako se menja video
    }
  }

  // Dodavanje komentara
  onAddComment() {
    const content = this.newCommentText.trim();
    if (content) {
      this.addComment.emit(content);
      this.newCommentText = '';
    }
  }

  // Brisanje komentara
  onDeleteComment(commentId: number) {
    this.deleteComment.emit(commentId);
  }

  // Edit komentara
  onEditComment(commentId: number) {
    const content = this.editTextMap[commentId]?.trim();
    if (content) {
      this.editComment.emit({ commentId, content });
      delete this.editTextMap[commentId];
    }
  }

  // Paginacija: slecedeca strana
  nextPage() {
    this.currentPage++;
    this.pageChange.emit(this.currentPage);
  }

  // Paginacija: prethodna strana
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.pageChange.emit(this.currentPage);
    }
  }
}