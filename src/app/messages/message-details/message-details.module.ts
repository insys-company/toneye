import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { MessageDetailsRoutingModule } from './message-details-routing.module';
import { MessageDetailsComponent } from './message-details.component';
import { MessageDetailsServicesModule } from './message-details-services.module';

@NgModule({
  declarations: [MessageDetailsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    MessageDetailsRoutingModule,
    MessageDetailsServicesModule
  ]
})
export class MessageDetailsModule { }
