import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { AccountDetailsRoutingModule } from './account-details-routing.module';
import { AccountDetailsComponent } from './account-details.component';
import { AccountDetailsServicesModule } from './account-details-services.module';

@NgModule({
  declarations: [AccountDetailsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    AccountDetailsRoutingModule,
    AccountDetailsServicesModule
  ]
})
export class AccountDetailsModule { }
