import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.css']
})
export class VerificationComponent implements OnInit {
  isLoading = true;
  successMessage = '';
  errorMessage = '';
  emailForResend = ''; // You might need to ask the user for their email if the token is completely invalid

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (token) {
        this.verifyToken(token);
      } else {
        this.isLoading = false;
        this.errorMessage = 'Invalid verification link. No token found.';
      }
    });
  }

  verifyToken(token: string) {
    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response || 'Your email has been successfully verified! You can now log in.'; 
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error || 'Verification failed. The link might be expired.';
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  requestNewToken() {
    this.router.navigate(['/resend-verification']);
  }
}
