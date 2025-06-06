import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  imports: [CommonModule, ReactiveFormsModule],  

})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.passwordForm.invalid) return;

    this.loading = true;
    this.userService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.success = 'Password changed successfully!';
        this.error = '';
        this.loading = false;
        this.passwordForm.reset();
      },
      error: () => {
        this.error = 'Failed to change password.';
        this.success = '';
        this.loading = false;
      }
    });
  }
}
