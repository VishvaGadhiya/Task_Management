import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { AuthGuard } from './guards/auth.guard';
import { TaskComponent } from './task/task.component';
import { UserTaskComponent } from './user-task/user-task.component';
import { ManagerComponent } from './manager/manager.component';
import { MyTasksComponent } from './my-tasks/my-tasks.component';
import { EmailConfirmComponent } from './email-confirm/email-confirm.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { ChangeEmailComponent } from './change-email/change-email.component';



export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'users', component: UserComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'usertasks', component: UserTaskComponent, canActivate: [AuthGuard], data: { roles: ['Admin', 'Manager'] } },
  { path: 'tasks', component: TaskComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'manager', component: ManagerComponent, canActivate: [AuthGuard], data: { roles: ['Admin'] } },
  { path: 'my-tasks', component: MyTasksComponent, canActivate: [AuthGuard], data: { roles: ['User'] } },
  { path: 'email-confirmation', component: EmailConfirmComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'access-denied', component: AccessDeniedComponent },
    { path: 'change-email', component: ChangeEmailComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

