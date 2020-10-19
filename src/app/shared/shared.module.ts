import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material/material.module';

import {
  AppGeneralViewerComponent,
  AppFilterComponent,
  AppTableViewerComponent,
  AppMultiselectComponent,
  AppMultiselectOverlayComponent,
} from './components';

import {
  ThousandsPipe,
  UnixDatePipe,
} from './pipes';

@NgModule({
  declarations: [
    AppFilterComponent,
    AppGeneralViewerComponent,
    AppTableViewerComponent,
    AppMultiselectComponent,
    AppMultiselectOverlayComponent,

    // pipes
    ThousandsPipe,
    UnixDatePipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
  ],
  providers: [],
  exports: [
    AppFilterComponent,
    AppGeneralViewerComponent,
    AppTableViewerComponent,
    AppMultiselectComponent,
    AppMultiselectOverlayComponent,

    // pipes
    ThousandsPipe,
    UnixDatePipe,
  ],
  entryComponents: [
    AppMultiselectOverlayComponent
  ],
})
export class SharedModule {}
