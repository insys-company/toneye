import { Injectable } from '@angular/core';
import { MessageDetailsServicesModule } from './message-details-services.module';
import { Apollo } from 'apollo-angular';
import { MessageQueries, TransactionQueries } from '../../api/queries';
import { Observable, Subject } from 'rxjs';
import { Message, Transaction } from '../../api';
import { map } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: MessageDetailsServicesModule
})
export class MessageDetailsService {
  protected _unsubscribe = new Subject();

  constructor(
    private apollo: Apollo,
    private messageQueries: MessageQueries,
    private transactionQueries: TransactionQueries,
  ) {
    // TODO
  }

  ngUnsubscribe(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  /**
   * Get message list
   * @param params Variables by filters for query
   */
  getMessage(_id: string | number): Observable<Message[]> {

    const _variables = {
      filter: {id: {eq: _id}}
    }

    return this.apollo.watchQuery<Message[]>({
      query: this.messageQueries.getMessages,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.messages]))
  }

  /**
   * Get transaction list
   * @param params Variables by filters for query
   */
  getTransaction(_id: string | number, isInMsg: boolean = false): Observable<Transaction[]> {

    const _variables = {
      filter: isInMsg ? {in_msg: { eq: _id}} : {out_msgs: {any: {eq: _id}}},
    }

    return this.apollo.watchQuery<Transaction[]>({
      query: this.transactionQueries.getTransaction,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.transactions]))
  }
}
