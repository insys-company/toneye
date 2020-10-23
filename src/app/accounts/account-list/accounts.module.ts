import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountsComponent } from './accounts.component';
import { AccountsServicesModule } from './accounts-services.module';

@NgModule({
  declarations: [AccountsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    AccountsRoutingModule,
    AccountsServicesModule
  ]
})
export class AccountsModule { }
