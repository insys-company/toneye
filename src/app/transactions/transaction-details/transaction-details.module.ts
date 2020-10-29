import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { TransactionDetailsRoutingModule } from './transaction-details-routing.module';
import { TransactionDetailsComponent } from './transaction-details.component';
import { TransactionDetailsServicesModule } from './transaction-details-services.module';

@NgModule({
  declarations: [TransactionDetailsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    TransactionDetailsRoutingModule,
    TransactionDetailsServicesModule
  ]
})
export class TransactionDetailsModule { }
