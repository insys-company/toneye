import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContractsComponent } from './contracts.component';

const routes: Routes = [
  { path: '', component: ContractsComponent, data: { animation: 'list' } },
  // { path: routeMap.affiliate, component: AffiliateDetailsComponent },
  // { path: routeMap.affiliate + '/:id', component: AffiliateDetailsComponent },
  // { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractsRoutingModule { }
