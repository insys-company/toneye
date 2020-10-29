import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountDetailsComponent } from './account-details.component';

const routes: Routes = [
  { path: '', component: AccountDetailsComponent, data: { animation: 'details' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountDetailsRoutingModule { }
