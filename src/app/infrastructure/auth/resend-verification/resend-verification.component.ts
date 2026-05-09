import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-resend-verification',
  templateUrl: './resend-verification.component.html',
  styleUrls: ['./resend-verification.component.css']
})
export class ResendVerificationComponent {
  email: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.resendVerificationEmail(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response; 
        console.log('Verification email resent successfully:', response);
        this.email = '';
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error resending verification email:', err);
        this.errorMessage = err.error || 'An error occurred while sending the email.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}