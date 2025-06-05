// ✅ email-confirm.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-email-confirm',
  standalone: true,
  template: `<p class="text-center">Please wait, confirming your email...</p>`,
})
export class EmailConfirmComponent implements OnInit {
  private baseUrl = 'https://localhost:7125/api/Account/confirm-email';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!userId || !token) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Link',
        text: 'User ID or token is missing.',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    this.http.get(`${this.baseUrl}?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Email Confirmed',
            text: 'Your email has been successfully confirmed.',
            confirmButtonColor: '#3b82f6'
          }).then(() => {
            this.router.navigate(['/login'], {
              queryParams: { confirmed: 'true' }
            });
          });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Confirmation Failed',
            text: 'Email confirmation failed or token is invalid.',
            confirmButtonColor: '#ef4444'
          });
        }
      });
  }
}
