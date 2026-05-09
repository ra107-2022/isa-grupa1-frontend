import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { MaterialModule } from '../material/material/material.module';
import { RegistrationComponent } from './registration/registration.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { CommentComponent } from './comment/comment.component';
import { Router, RouterModule } from '@angular/router';
import { VerificationComponent } from './verification/verification.component';
import { ResendVerificationComponent } from './resend-verification/resend-verification.component';



@NgModule({
  declarations: [
    LoginComponent,
    RegistrationComponent,
    UserProfileComponent,
    CommentComponent,
    VerificationComponent,
    ResendVerificationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    LoginComponent,
    CommentComponent
  ]
})
export class AuthModule { }
