import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { BlocksRoutingModule } from './blocks-routing.module';
import { BlocksComponent } from './blocks.component';
import { BlocksServicesModule } from './blocks-services.module';

@NgModule({
  declarations: [BlocksComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    BlocksRoutingModule,
    BlocksServicesModule
  ]
})
export class BlocksModule { }
