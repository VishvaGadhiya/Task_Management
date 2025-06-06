import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = this.authService.getToken();
    const expectedRoles = route.data['roles'] as string[]; 
    const userRole = this.authService.getUserRole();

    if (!token || !userRole) {
      this.router.navigate(['/access-denied']);
      return false;
    }

    if (expectedRoles && !expectedRoles.includes(userRole)) {
      this.router.navigate(['/access-denied']);
      return false;
    }

    return true;
  }
}
