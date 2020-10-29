import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from '../../shared/shared.module';

import { BlockDetailsRoutingModule } from './block-details-routing.module';
import { BlockDetailsComponent } from './block-details.component';
import { BlockDetailsServicesModule } from './block-details-services.module';

@NgModule({
  declarations: [BlockDetailsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    BlockDetailsRoutingModule,
    BlockDetailsServicesModule
  ]
})
export class BlockDetailsModule { }
