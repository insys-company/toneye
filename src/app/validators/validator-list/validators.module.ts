import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { ValidatorsRoutingModule } from './validators-routing.module';
import { ValidatorsComponent } from './validators.component';
import { ValidatorsServicesModule } from './validators-services.module';

@NgModule({
  declarations: [ValidatorsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    ValidatorsRoutingModule,
    ValidatorsServicesModule
  ]
})
export class ValidatorsModule { }
