import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private authService: AuthService) {}

  submit() {
  this.authService.forgotPassword(this.email).subscribe({
    next: (response) => {
      Swal.fire({
        icon: 'success',
        title: 'Email Sent',
        text: response,  // Use backend's plain text response
        confirmButtonColor: '#3b82f6'
      });
    },
    error: () => {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Email not found or error occurred.',
        confirmButtonColor: '#ef4444'
      });
    }
  });
}


}
