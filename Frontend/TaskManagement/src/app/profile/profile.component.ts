import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user.service'; // create this to call API
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
    imports: [RouterModule, CommonModule, FormsModule,ReactiveFormsModule],

})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      gender: ['', Validators.required]
    });

    this.loadUserProfile();
  }
loadUserProfile() {
  this.userService.getProfile().subscribe({
    next: (data) => {
      this.profileForm.patchValue({
        fullName: data.name,  
        gender: data.gender
      });
    },
    error: (err) => {
      this.error = 'Failed to load profile data.';
    }
  });
}

selectedFile!: File | null;

onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input?.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
  }
}

 onSubmit() {
  if (this.profileForm.invalid) return;

  this.loading = true;

  const formData = new FormData();
  formData.append('name', this.profileForm.value.fullName);
  formData.append('gender', this.profileForm.value.gender);
  if (this.selectedFile) {
    formData.append('profileImage', this.selectedFile);
  }

  this.userService.updateProfile(formData).subscribe({
    next: () => {
      this.success = 'Profile updated successfully!';
      this.error = '';
      this.loading = false;
          this.loadUserProfile();

    },
    error: (error) => {
      this.error = 'Failed to update profile: ' + (error.message || 'Unknown error');
      this.success = '';
      this.loading = false;
      this.profileForm.patchValue({
  fullName: this.profileForm.value.fullName,
  gender: this.profileForm.value.gender
});
    }
  });
}
}