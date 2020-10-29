import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ValidatorsComponent } from './validators.component';

const routes: Routes = [
  { path: '', component: ValidatorsComponent, data: { animation: 'list' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValidatorsRoutingModule { }
