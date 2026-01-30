import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserProfile } from '../model/user-profile.model';
import { UserProfileService } from '../service/user-profile.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  userProfile?: UserProfile;
  loading: boolean = true;
  errorMessage: string = '';

  editForm!: FormGroup;
  isEditing: boolean = false;

  isMyProfile: boolean = false; // Da znamo da li je /me ili javni profil

  constructor(
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Inicijalizacija forme
    this.editForm = this.fb.group({
      username: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    const pathSegments = this.route.snapshot.url.map(segment => segment.path);
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    console.log('Current path:', pathSegments );

    if (lastSegment === 'me') {
      // My Profile
      this.isMyProfile = true;
      this.fetchMyProfile();
    } else {
      // Pretpostavljamo ID u path-u
      const idParam = this.route.snapshot.paramMap.get('id');
      const userId = idParam ? Number(idParam) : null;
      if (userId !== null && !isNaN(userId)) {
        this.isMyProfile = false;
        this.fetchUserProfileById(userId);
      } else {
        this.errorMessage = 'Invalid profile path';
        this.loading = false;
      }
    }
  }


  // =========================
  // GET profile po ID-u (javni)
  // =========================
  private fetchUserProfileById(userId: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.userProfileService.getUserProfile(userId).subscribe({
      next: profile => this.onProfileFetched(profile),
      error: () => {
        this.errorMessage = 'User not found';
        this.loading = false;
      }
    });
  }

  // =========================
  // GET /me - za ulogovanog korisnika
  // =========================
  private fetchMyProfile(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userProfileService.getMyProfile().subscribe({
      next: profile => this.onProfileFetched(profile),
      error: err => {
        this.errorMessage = err?.error || 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  private onProfileFetched(profile: UserProfile): void {
    this.userProfile = profile;
    this.loading = false;

    // Popuni formu
    this.editForm.patchValue({
      username: profile.username,
      name: profile.name,
      surname: profile.surname,
      email: profile.email
    });
  }

  // =========================
  // EDIT My Profile
  // =========================
  onEdit(): void {
    if (!this.isMyProfile) return; // Samo My Profile se moze menjati
    this.isEditing = true;
  }

  onCancelEdit(): void {
    this.isEditing = false;
    if (this.userProfile) {
      this.editForm.patchValue({
        username: this.userProfile.username,
        name: this.userProfile.name,
        surname: this.userProfile.surname,
        email: this.userProfile.email
      });
    }
  }

  onSave(): void {
    if (!this.userProfile || this.editForm.invalid || !this.isMyProfile) return;

    const updatedData: Partial<UserProfile> = this.editForm.value;

    this.userProfileService.updateMyProfile(updatedData).subscribe({
      next: updatedProfile => {
        this.userProfile = updatedProfile;
        this.isEditing = false;
      },
      error: err => {
        this.errorMessage = err?.error || 'Failed to update profile';
      }
    });
  }

  // =========================
  // DELETE My Profile
  // =========================
  onDelete(): void {
    if (!this.userProfile || !this.isMyProfile) return;

    if (confirm('Are you sure you want to delete your profile?')) {
      this.userProfileService.deleteMyProfile().subscribe({
        next: () => {
          alert('Profile deleted successfully.');
          this.authService.logout(); // Logout nakon brisanja
        },
        error: err => {
          this.errorMessage = err?.error || 'Failed to delete profile';
        }
      });
    }
  }
}
