import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  model = {
    userName: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.authService.login(this.model.userName, this.model.password).subscribe({
      next: (res) => {

        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'Welcome back!',
          confirmButtonColor: '#3b82f6'
        }).then(() => {
          const role = this.authService.getUserRole();

          // ✅ Navigate based on role
          if (role === 'Admin') {
            this.router.navigate(['/users']);
          } else if (role === 'Manager') {
            this.router.navigate(['/usertasks']);
          } else if (role === 'User') {
            this.router.navigate(['/my-tasks']);
          } else {
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Invalid username or password. Please try again.',
          confirmButtonColor: '#ef4444'
        });
        console.error(err);
      }
    });
  }
}
