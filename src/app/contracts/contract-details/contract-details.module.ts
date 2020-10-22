import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { ContractDetailsRoutingModule } from './contract-details-routing.module';
import { ContractDetailsComponent } from './contract-details.component';
import { ContractDetailsServicesModule } from './contract-details-services.module';

@NgModule({
  declarations: [ContractDetailsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    ContractDetailsRoutingModule,
    ContractDetailsServicesModule
  ]
})
export class ContractDetailsModule { }
