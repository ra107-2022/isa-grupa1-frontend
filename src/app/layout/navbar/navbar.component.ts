import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  constructor(private authService: AuthService,
              private router: Router) { }

  user: User | undefined;

  get isLoggedIn(): boolean {
    return this.user?.id !== 0;
  }

  onUpload() {
    this.router.navigate(['/upload']);
  }

  ngOnInit(): void {
    this.authService.checkIfUserExists();
    
    this.authService.user$.subscribe(user => {
      console.log("aaaa");
    
      console.log(user);
      this.user = user;
    });
  }

  onLogout(): void {
    this.authService.logout();
  }

  // get isLoggedIn(): boolean {
  //   return this.authService.isLoggedIn();
  // }

  goToMyProfile() {
    this.router.navigate(['user/me']);
  }

}
