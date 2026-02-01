import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { VideoCardComponent } from './video-card/video-card.component';
import { MaterialModule } from '../infrastructure/material/material/material.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthModule } from '../infrastructure/auth/auth.module';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { RatingsComponent } from './ratings/ratings.component';
import { VideoComponent } from './video/video.component';
import { FormsModule } from '@angular/forms';
import { CommentSectionComponent } from './comment-section/comment-section.component';
import { PerformanceGraphComponent } from './performance-graph/performance-graph.component';

@NgModule({
  declarations: [
    HomeComponent,
    NavbarComponent,
    VideoCardComponent,
    RatingsComponent,
    VideoComponent,
    CommentSectionComponent,
    PerformanceGraphComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    MatToolbarModule,
    RouterModule,
    AuthModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule
  ],
  exports: [
    HomeComponent,
    NavbarComponent,
    VideoCardComponent
  ]
})
export class LayoutModule { }
