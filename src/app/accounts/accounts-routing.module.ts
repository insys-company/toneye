import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountsComponent } from './accounts.component';

const routes: Routes = [
  { path: '', component: AccountsComponent, data: { animation: 'list' } },
  // { path: routeMap.affiliate, component: AffiliateDetailsComponent },
  // { path: routeMap.affiliate + '/:id', component: AffiliateDetailsComponent },
  // { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountsRoutingModule { }
