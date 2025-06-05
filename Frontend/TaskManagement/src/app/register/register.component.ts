import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegisterService } from './register.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  providers: [RegisterService]
})
export class RegisterComponent {
  model = {
    userName: '',
    email: '',
    name: '',
    gender: '',
    joinDate: '',
    password: '',
    confirmPassword: ''
  };

  successMessage = '';
  errorMessage = '';

  constructor(private registerService: RegisterService) {}

  onSubmit() {
    this.registerService.register(this.model).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'Check your email to confirm your account.',
          confirmButtonColor: '#3b82f6'
        });

        this.model = {
          userName: '',
          email: '',
          name: '',
          gender: '',
          joinDate: '',
          password: '',
          confirmPassword: ''
        };
      },
      error: err => {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'Please check your inputs or try again later.',
          confirmButtonColor: '#ef4444'
        });

        console.error(err);
      }
    });
  }
}
