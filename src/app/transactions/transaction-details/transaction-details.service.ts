import { Injectable } from '@angular/core';
import { TransactionDetailsServicesModule } from './transaction-details-services.module';
import { Apollo } from 'apollo-angular';
import { BlockQueries, TransactionQueries } from '../../api/queries';
import { Observable, Subject } from 'rxjs';
import { Block, Transaction } from '../../api';
import { map } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: TransactionDetailsServicesModule
})
export class TransactionDetailsService {
  protected _unsubscribe = new Subject();

  constructor(
    private apollo: Apollo,
    private blockQueries: BlockQueries,
    private transactionQueries: TransactionQueries,
  ) {
    // TODO
  }

  ngUnsubscribe(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  /**
   * Get transaction list
   * @param params Variables by filters for query
   */
  getTransaction(_id: string | number): Observable<Transaction[]> {

    const _variables = {
      filter: {id: {eq: _id}}
    }

    return this.apollo.watchQuery<Transaction[]>({
      query: this.transactionQueries.getTransaction,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.transactions]))
  }

  /**
   * Get block list
   * @param params Variables by filters for query
   */
  getBlock(_id: string | number): Observable<Block[]> {

    const _variables = {
      filter: {id: {eq: _id}},
    }

    return this.apollo.watchQuery<Block[]>({
      query: this.blockQueries.getBlocks,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]))
  }
}
