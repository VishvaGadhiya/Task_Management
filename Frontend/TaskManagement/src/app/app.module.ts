import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@NgModule({
  providers: [
      { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }

  ]
})
export class AppModule {}
