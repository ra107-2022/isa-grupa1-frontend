import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Login } from '../model/login.model';
import { ACCESS_TOKEN } from 'src/constants';
import { TokenStorage } from '../jwt/token.storage';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
constructor(
    private authService: AuthService,
    private router: Router,
    private tokenStorage: TokenStorage
  ) {}

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  login(): void {
  const login: Login = {
    email: this.loginForm.value.email || "",
    password: this.loginForm.value.password || "",
  };

  if (this.loginForm.valid) {
    this.authService.login(login).subscribe({
      next: (response) => {
        console.log("token:", response.token);

        this.router.navigate(['home']);
      },
      error: (e) => {
        console.error(e);
        alert("Login failed");
      }
    });
  }
}
}
