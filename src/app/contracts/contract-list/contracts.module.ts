import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { ContractsRoutingModule } from './contracts-routing.module';
import { ContractsComponent } from './contracts.component';
import { ContractsServicesModule } from './contracts-services.module';

@NgModule({
  declarations: [ContractsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    ContractsRoutingModule,
    ContractsServicesModule
  ]
})
export class ContractsModule { }
