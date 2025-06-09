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
    confirmPassword: '',
      profileImage: null as File | null

  };

  successMessage = '';
  errorMessage = '';

  constructor(private registerService: RegisterService) {}
  
imagePreview: string | ArrayBuffer | null = null;

onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.model.profileImage = file;

    const reader = new FileReader();
    reader.onload = e => this.imagePreview = reader.result;
    reader.readAsDataURL(file);
  }
}


  onSubmit() {
  const formData = new FormData();
  formData.append('UserName', this.model.userName);
  formData.append('Email', this.model.email);
  formData.append('Name', this.model.name);
  formData.append('Gender', this.model.gender);
  formData.append('JoinDate', this.model.joinDate);
  formData.append('Password', this.model.password);
  formData.append('ConfirmPassword', this.model.confirmPassword);

  if (this.model.profileImage) {
    formData.append('ProfileImage', this.model.profileImage);
  }

  this.registerService.register(formData).subscribe({
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
        confirmPassword: '',
        profileImage: null
      };
    },
    error: err => {
      let errorText = 'Please check your inputs or try again later.';

      if (err.error && typeof err.error === 'object') {
        const validationErrors = Object.values(err.error).flat().join(' ');
        errorText = validationErrors;
      }

      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorText,
        confirmButtonColor: '#ef4444'
      });

      console.error(err);
    }
  });
}
}