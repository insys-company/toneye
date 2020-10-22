import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { MessagesRoutingModule } from './messages-routing.module';
import { MessagesComponent } from './messages.component';
import { MessagesServicesModule } from './messages-services.module';

@NgModule({
  declarations: [MessagesComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    MessagesRoutingModule,
    MessagesServicesModule
  ]
})
export class MessagesModule { }
