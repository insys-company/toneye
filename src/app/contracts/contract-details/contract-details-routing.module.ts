import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContractDetailsComponent } from './contract-details.component';

const routes: Routes = [
  { path: '', component: ContractDetailsComponent, data: { animation: 'details' } },
  // { path: routeMap.affiliate, component: AffiliateDetailsComponent },
  // { path: routeMap.affiliate + '/:id', component: AffiliateDetailsComponent },
  // { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractDetailsRoutingModule { }
