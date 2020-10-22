import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessagesComponent } from './messages.component';

const routes: Routes = [
  { path: '', component: MessagesComponent, data: { animation: 'list' } },
  // { path: routeMap.affiliate, component: AffiliateDetailsComponent },
  // { path: routeMap.affiliate + '/:id', component: AffiliateDetailsComponent },
  // { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagesRoutingModule { }
