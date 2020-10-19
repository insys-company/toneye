import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';

import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionsComponent } from './transactions.component';
import { TransactionsServicesModule } from './transactions-services.module';

@NgModule({
  declarations: [TransactionsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    TransactionsRoutingModule,
    TransactionsServicesModule
  ]
})
export class TransactionsModule { }
