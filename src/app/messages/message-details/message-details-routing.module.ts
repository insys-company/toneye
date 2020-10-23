import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessageDetailsComponent } from './message-details.component';

const routes: Routes = [
  { path: '', component: MessageDetailsComponent, data: { animation: 'details' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessageDetailsRoutingModule { }
