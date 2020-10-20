import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { appRouteMap } from './app-route-map';

const routes: Routes = [

  /** Редирект с кароткого адреса на длинный */
  { path: 'a', redirectTo: appRouteMap.accounts, pathMatch: 'full' },
  { path: 'b', redirectTo: appRouteMap.blocks, pathMatch: 'full' },
  { path: 't', redirectTo: appRouteMap.transactions, pathMatch: 'full' },
  { path: 'm', redirectTo: appRouteMap.messages, pathMatch: 'full' },
  { path: 'h', redirectTo: appRouteMap.home, pathMatch: 'full' },

  { path: appRouteMap.accounts, loadChildren: () => import('./accounts/accounts.module').then(m => m.AccountsModule) },
  { path: appRouteMap.blocks, loadChildren: () => import('./blocks/blocks.module').then(m => m.BlocksModule) },
  { path: appRouteMap.transactions, loadChildren: () => import('./transactions/transactions.module').then(m => m.TransactionsModule) },
  { path: appRouteMap.messages, loadChildren: () => import('./messages/messages.module').then(m => m.MessagesModule) },

  // { path: appRouteMap.account + '\:id', loadChildren: () => import('./accounts/accounts.module').then(m => m.AccountsModule) },
  // { path: appRouteMap.block + '\:id', loadChildren: () => import('./blocks/blocks.module').then(m => m.BlocksModule) },
  // { path: appRouteMap.transaction + '\:id', loadChildren: () => import('./transactions/transactions.module').then(m => m.TransactionsModule) },
  { path: appRouteMap.message + '/:id', loadChildren: () => import('./messages/message-details/message-details.module').then(m => m.MessageDetailsModule) },

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
