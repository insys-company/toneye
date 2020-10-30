import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material/material.module';

import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';

import {
  AppGeneralViewerComponent,
  AppFilterComponent,
  AppTableViewerComponent,
  AppMultiselectComponent,
  AppMultiselectOverlayComponent,
  AppSearchComponent,
  AppSearchOverlayComponent,
  AppMinmaxComponent,
  AppMinmaxOverlayComponent,
  AppDatepickerComponent,
  AppDatepickerOverlayComponent,
} from './components';

import {
  BooleanToWordPipe,
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
    AppSearchComponent,
    AppSearchOverlayComponent,
    AppMinmaxComponent,
    AppMinmaxOverlayComponent,
    AppDatepickerComponent,
    AppDatepickerOverlayComponent,

    // pipes
    BooleanToWordPipe,
    ThousandsPipe,
    UnixDatePipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
  ],
  providers: [],
  exports: [
    AppFilterComponent,
    AppGeneralViewerComponent,
    AppTableViewerComponent,
    AppMultiselectComponent,
    AppMultiselectOverlayComponent,
    AppSearchComponent,
    AppSearchOverlayComponent,
    AppMinmaxComponent,
    AppMinmaxOverlayComponent,
    AppDatepickerComponent,
    AppDatepickerOverlayComponent,

    // pipes
    BooleanToWordPipe,
    ThousandsPipe,
    UnixDatePipe,
  ],
  entryComponents: [
    AppMultiselectOverlayComponent,
    AppSearchOverlayComponent,
    AppMinmaxOverlayComponent,
    AppDatepickerOverlayComponent,
  ],
})
export class SharedModule {}
