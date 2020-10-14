import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { appRouteMap } from './app-route-map';

const routes: Routes = [

  { path: appRouteMap.accounts, loadChildren: () => import('./accounts/accounts.module').then(m => m.AccountsModule) },

  { path: appRouteMap.blocks, loadChildren: () => import('./blocks/blocks.module').then(m => m.BlocksModule) },

  { path: appRouteMap.transactions, loadChildren: () => import('./transactions/transactions.module').then(m => m.TransactionsModule) },

  { path: appRouteMap.messages, loadChildren: () => import('./messages/messages.module').then(m => m.MessagesModule) },

  // Empty page for children
  { path: appRouteMap.home, loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },

  { path: '', redirectTo: appRouteMap.home, pathMatch: 'full' },

  { path: '**', redirectTo: appRouteMap.home }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
