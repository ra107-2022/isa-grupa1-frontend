import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../../layout/home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { AuthGuard } from '../auth/auth.guard';
import { RegistrationComponent } from '../auth/registration/registration.component';
import { VideoUploadComponent } from '../../layout/video-upload/video-upload.component';
import { UserProfileComponent } from '../auth/user-profile/user-profile.component';
import { VideoComponent } from '../../layout/video/video.component';

const routes: Routes = [
  // Default
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Public
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'upload', component: VideoUploadComponent, canActivate: [AuthGuard] },
  { path: 'users/:id', component: UserProfileComponent },
  { path: 'video/:id', component: VideoComponent },
  { path: 'users/me', component: UserProfileComponent },

  //{ path: 'profile/me', component: UserProfileComponent, canActivate: [AuthGuard] }, // Moj profil

  // Fallback when no prior route is matched
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
