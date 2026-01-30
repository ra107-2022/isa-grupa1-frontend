import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommentDto, Page } from '../model/comment.model';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnChanges {

  //  INPUTS
  @Input() comments: CommentDto[] = [];
  @Input() isAuthenticated: boolean = false;
  @Input() videoId!: number;           // id videa (za reset paginacije)
  @Input() pageSize: number = 20;
  @Input() currentUserId!: number;

  //  OUTPUTS 
  @Output() addComment = new EventEmitter<string>();
  @Output() deleteComment = new EventEmitter<number>();
  @Output() editComment = new EventEmitter<{ commentId: number, content: string }>();
  @Output() pageChange = new EventEmitter<number>();

  //  STATE 
  newCommentText: string = '';
  editTextMap: { [key: number]: string } = {};
  currentPage: number = 0;

  // Pagination metadata
  totalPages: number = 0;
  totalComments: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoId']) {
      this.currentPage = 0;
    }
  }

  //  ACTIONS 

  onAddComment(): void {
    const content = this.newCommentText.trim();
    if (!content) return;

    this.addComment.emit(content);
    this.newCommentText = '';
  }

  onDeleteComment(commentId: number): void {
    this.deleteComment.emit(commentId);
  }

  onEditComment(commentId: number): void {
    const content = this.editTextMap[commentId]?.trim();
    if (!content) return;

    this.editComment.emit({ commentId, content });
    delete this.editTextMap[commentId];
  }

  //  PAGINATION 

  nextPage(): void {
    if (this.currentPage + 1 >= this.totalPages) return;
    this.currentPage++;
    this.pageChange.emit(this.currentPage);
  }

  prevPage(): void {
    if (this.currentPage === 0) return;
    this.currentPage--;
    this.pageChange.emit(this.currentPage);
  }


  // Pozvati kada dobijemo novu stranicu komentara sa servisa
  setCommentsPage(pageData: Page<CommentDto>): void {
    this.comments = pageData.content;
    this.totalPages = pageData.totalPages;
    this.totalComments = pageData.totalElements;
  }

  canEdit(comment: CommentDto): boolean {
    return this.currentUserId === comment.authorId;
  }

  canDelete(comment: CommentDto): boolean {
    return this.currentUserId === comment.authorId;
  }
}
