import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserProfile } from '../models/Dtos/profile.model';

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
})
export class ChangeEmailComponent implements OnInit {
  changeEmailForm: FormGroup;
  message: string | null = null;
  error: string | null = null;
  currentEmail: string = '';

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.changeEmailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        this.currentEmail = profile.email || 'Email not available';
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.currentEmail = 'Unable to load email';
      }
    });
  }

  onSubmit(): void {
    if (this.changeEmailForm.invalid) {
      this.changeEmailForm.markAllAsTouched();
      return;
    }

    this.userService.changeEmail(this.changeEmailForm.value).subscribe({
      next: () => {
        this.message = 'Confirmation email sent. Please check your inbox.';
        this.error = null;
        this.changeEmailForm.reset();
      },
      error: (err) => {
        console.error('Change email failed:', err);
        this.error = err?.error?.message || 'Failed to send confirmation email.';
        this.message = null;
      }
    });
  }
}
