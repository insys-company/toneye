import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { ValidatorDetailsRoutingModule } from './validator-details-routing.module';
import { ValidatorDetailsComponent } from './validator-details.component';
import { ValidatorDetailsServicesModule } from './validator-details-services.module';

@NgModule({
  declarations: [ValidatorDetailsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    ValidatorDetailsRoutingModule,
    ValidatorDetailsServicesModule
  ]
})
export class ValidatorDetailsModule { }
