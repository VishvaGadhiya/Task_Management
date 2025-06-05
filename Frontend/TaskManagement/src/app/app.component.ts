import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  providers:[
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'TaskManagement';
  userEmail: string | null = null;

  loggedIn: boolean = false;
  userRole: string | null = null;

  constructor(public authService: AuthService, private router: Router) {}

ngOnInit() {
  this.authService.isLoggedIn().subscribe(status => {
    this.loggedIn = status;
    this.userRole = status ? this.authService.getUserRole() : null;
    this.userEmail = status ? this.authService.getUserEmail() : null;

    console.log("LOGGED IN:", this.loggedIn);
    console.log("USER ROLE:", this.userRole);
    console.log("USER EMAIL:", this.userEmail);
  });
}


  private updateLoginStatus() {
    this.loggedIn = !!this.authService.getToken();
    this.userRole = this.authService.getUserRole();
        this.userEmail = this.authService.getUserEmail();

  }

  logout() {
    this.authService.logout();
    this.loggedIn = false;
    this.userRole = null;
        this.userEmail = null;

    this.router.navigate(['/login']);
  }
}
