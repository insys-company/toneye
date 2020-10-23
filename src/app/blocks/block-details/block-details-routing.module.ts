import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BlockDetailsComponent } from './block-details.component';

const routes: Routes = [
  { path: '', component: BlockDetailsComponent, data: { animation: 'details' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlockDetailsRoutingModule { }
