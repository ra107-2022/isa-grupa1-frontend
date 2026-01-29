import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserProfile } from '../model/user-profile.model';
import { UserProfileService } from '../service/user-profile.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  userProfile?: UserProfile;
  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private userProfileService: UserProfileService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.userProfileService.getUserProfile(id).subscribe({
        next: profile => {
          console.log(profile);
          

          this.userProfile = profile;
          this.loading = false;
        },
        
        error: err => {
          this.errorMessage = 'User not found';
          this.loading = false;
        }
      });
    } else {
      this.errorMessage = 'Invalid user ID';
      this.loading = false;
    }
  }
}
