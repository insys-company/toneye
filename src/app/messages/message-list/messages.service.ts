import { Injectable } from '@angular/core';
import { MessagesServicesModule } from './messages-services.module';
import { Apollo } from 'apollo-angular';
import { BlockQueries, CommonQueries, MessageQueries, TransactionQueries } from '../../api/queries';
import { Observable, Subject } from 'rxjs';
import { Block, Message, Transaction, QueryOrderBy } from '../../api';
import { map } from 'rxjs/operators';
// import 'rxjs/add/operator/map';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: MessagesServicesModule
})
export class MessagesService {
  protected _unsubscribe = new Subject();

  constructor(
    private apollo: Apollo,
    private blockQueries: BlockQueries,
    private commonQueries: CommonQueries,
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
   * Get general information
   *
   * queries:
   * getAccountsCount
   * aggregateTransactions
   * getAccountsTotalBalance
   */
  getGeneralData(): Observable<any>{
    return this.apollo.watchQuery<any>({
      query: this.commonQueries.getAggregateMessages,
      variables: {
        filter: {},
      },
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data))
  }

  /**
   * Get message list
   * @param params Variables by filters for query
   */
  getMessages(params?: any): Observable<Message[]> {

    const _variables = {
      filter: {},
      orderBy: [{path: 'created_at', direction: 'DESC'}],
      limit: 50
    }

    return this.apollo.watchQuery<Message[]>({
      query: this.messageQueries.getMessages,
      variables: params ? params : _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.messages]))
  }
}
