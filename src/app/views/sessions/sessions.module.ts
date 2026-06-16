import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SessionsRoutingModule } from './sessions-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { ForgotComponent } from './forgot/forgot.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    SessionsRoutingModule
  ],
  declarations: [ForgotComponent, ResetPasswordComponent]
})
export class SessionsModule { }
