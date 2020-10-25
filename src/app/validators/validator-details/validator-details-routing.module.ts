import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ValidatorDetailsComponent } from './validator-details.component';

const routes: Routes = [
  { path: '', component: ValidatorDetailsComponent, data: { animation: 'details' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValidatorDetailsRoutingModule { }
