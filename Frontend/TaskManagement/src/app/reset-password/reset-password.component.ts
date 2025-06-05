import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  model = {
    userId: '',
    email: '',
    token: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    // Read query params from URL
    this.model.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.model.userId = this.route.snapshot.queryParamMap.get('userId') || '';
    const rawToken = this.route.snapshot.queryParamMap.get('token') || '';
    this.model.token = decodeURIComponent(rawToken);
  }

  submit() {
    // Basic validation for matching passwords
    if (this.model.password !== this.model.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Password and Confirm Password do not match.',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    this.authService.resetPassword(this.model).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Password Reset Successful',
          text: 'You can now log in with your new password.',
          confirmButtonColor: '#3b82f6'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Reset Failed',
          text: 'Invalid token or error occurred.',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }
}
