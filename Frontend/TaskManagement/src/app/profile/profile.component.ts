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
        fullName: data.name,  // 🔑 Correct mapping
        gender: data.gender
      });
    },
    error: (err) => {
      this.error = 'Failed to load profile data.';
    }
  });
}


  onSubmit() {
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.userService.updateProfile({
  name: this.profileForm.value.fullName,
  gender: this.profileForm.value.gender
}).subscribe({
  next: () => { 
    this.success = 'Profile updated successfully!';
    this.loading = false;
  },
  error: () => {
    this.error = 'Failed to update profile.';
    this.loading = false;
  }
});

  }
}
