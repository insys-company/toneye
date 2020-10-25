import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { appRouteMap } from './app-route-map';

const routes: Routes = [

  /** Редирект с кароткого адреса на длинный */
  { path: 'a', redirectTo: appRouteMap.accounts, pathMatch: 'full' },
  { path: 'b', redirectTo: appRouteMap.blocks, pathMatch: 'full' },
  { path: 't', redirectTo: appRouteMap.transactions, pathMatch: 'full' },
  { path: 'm', redirectTo: appRouteMap.messages, pathMatch: 'full' },
  { path: 'c', redirectTo: appRouteMap.contracts, pathMatch: 'full' },
  { path: 'v', redirectTo: appRouteMap.validators, pathMatch: 'full' },
  { path: 'h', redirectTo: appRouteMap.home, pathMatch: 'full' },

  // Empty page for children
  { path: appRouteMap.home, loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },

  { path: appRouteMap.accounts, loadChildren: () => import('./accounts/account-list/accounts.module').then(m => m.AccountsModule) },
  { path: appRouteMap.blocks, loadChildren: () => import('./blocks/block-list/blocks.module').then(m => m.BlocksModule) },
  { path: appRouteMap.transactions, loadChildren: () => import('./transactions/transaction-list/transactions.module').then(m => m.TransactionsModule) },
  { path: appRouteMap.messages, loadChildren: () => import('./messages/message-list/messages.module').then(m => m.MessagesModule) },
  { path: appRouteMap.contracts, loadChildren: () => import('./contracts/contract-list/contracts.module').then(m => m.ContractsModule) },
  { path: appRouteMap.validators, loadChildren: () => import('./validators/validator-list/validators.module').then(m => m.ValidatorsModule) },

  { path: appRouteMap.account + '/:id', loadChildren: () => import('./accounts/account-details/account-details.module').then(m => m.AccountDetailsModule) },
  { path: appRouteMap.block + '/:id', loadChildren: () => import('./blocks/block-details/block-details.module').then(m => m.BlockDetailsModule) },
  { path: appRouteMap.transaction + '/:id', loadChildren: () => import('./transactions/transaction-details/transaction-details.module').then(m => m.TransactionDetailsModule) },
  { path: appRouteMap.message + '/:id', loadChildren: () => import('./messages/message-details/message-details.module').then(m => m.MessageDetailsModule) },
  { path: appRouteMap.contract + '/:id', loadChildren: () => import('./contracts/contract-details/contract-details.module').then(m => m.ContractDetailsModule) },
  { path: appRouteMap.validator + '/:id', loadChildren: () => import('./validators/validator-details/validator-details.module').then(m => m.ValidatorDetailsModule) },

  { path: '', redirectTo: appRouteMap.home, pathMatch: 'full' },

  { path: '**', redirectTo: appRouteMap.home }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
