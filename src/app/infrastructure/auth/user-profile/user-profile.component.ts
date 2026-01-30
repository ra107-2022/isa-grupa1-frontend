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

  // Forma za edit
  editForm!: FormGroup;
  isEditing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private fb: FormBuilder,
    private authService: AuthService // za logout
  ) {}

  // Getter za current user ID
  get currentUserId(): number {
    return this.authService.currentUser?.id || 0;
  }

  ngOnInit(): void {
    // Inicijalizacija forme
    this.editForm = this.fb.group({
      username: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const userId = idParam ? Number(idParam) : null;

      if (userId !== null && !isNaN(userId)) {
        this.fetchUserProfile(userId);
      } else {
        this.errorMessage = 'Invalid user ID';
        this.loading = false;
      }
    });
  }

  private fetchUserProfile(userId: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.userProfileService.getUserProfile(userId).subscribe({
      next: profile => {
        this.userProfile = profile;
        this.loading = false;

        // Popuni formu sa postojecim podacima
        this.editForm.patchValue({
          username: profile.username,
          name: profile.name,
          surname: profile.surname,
          email: profile.email
        });
      },
      error: () => {
        this.errorMessage = 'User not found';
        this.loading = false;
      }
    });
  }

  // ===== EDIT =====
  onEdit(): void {
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
    if (!this.userProfile) return;
    if (this.editForm.invalid) return;

    const updatedData: Partial<UserProfile> = this.editForm.value;

    this.userProfileService.updateUserProfile(this.userProfile.id, updatedData).subscribe({
      next: updatedProfile => {
        this.userProfile = updatedProfile;
        this.isEditing = false;
      },
      error: err => {
        this.errorMessage = err?.error || 'Failed to update profile';
      }
    });
  }

  // ===== DELETE =====
  onDelete(): void {
    if (!this.userProfile) return;

    if (confirm('Are you sure you want to delete your profile?')) {
      this.userProfileService.deleteUserProfile(this.userProfile.id).subscribe({
        next: () => {
          alert('Profile deleted successfully.');
          // Poziva AuthService da izloguje korisnika i vrati ga na home
          this.authService.logout();
        },
        error: err => {
          this.errorMessage = err?.error || 'Failed to delete profile';
        }
      });
    }
  }
}