import { Injectable } from '@angular/core';
import { HomeServicesModule } from './home-services.module';
import { Apollo } from 'apollo-angular';
import { BlockQueries, CommonQueries, MessageQueries, TransactionQueries } from '../api/queries';
import { Observable, Subject } from 'rxjs';
import { Block, Message, Transaction, QueryOrderBy } from '../api';
import { map } from 'rxjs/operators';
// import 'rxjs/add/operator/map';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from '../app-route-map';

@Injectable({
  providedIn: HomeServicesModule
})
export class HomeService {
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
   * Get master block for
   *
   * prev_key_block_seqno
   * seq_no and
   * master
   * 
   * return one block
   */
  getMasterBlock(): Observable<Block[]> {
    return this.apollo.watchQuery<Block[]>({
      query: this.blockQueries.getMasterBlock,
      // static for master
      variables: {
        filter: {workchain_id: {eq: -1}},
        limit: 1,
        orderBy: [new QueryOrderBy({path: "seq_no", direction: "DESC"})]
      },
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]))
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
      query: this.commonQueries.getGeneralData,
      variables: {},
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data))
  }

  /**
   * Get block list
   * @param params Variables by filters for query
   */
  getBlocks(params?: any): Observable<Block[]> {

    const _variables = {
      filter: {},
      limit: 50,
      orderBy: [new QueryOrderBy({path: 'gen_utime', direction: 'DESC'})]
    }

    return this.apollo.watchQuery<Block[]>({
      query: this.blockQueries.getBlocks,
      variables: params ? params : _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.blocks]))
  }

  /**
   * Get message list
   * @param params Variables by filters for query
   */
  getMessages(params?: any): Observable<Message[]> {

    const _variables = {
      filter: {},
      limit: 50,
      orderBy: [{path: 'created_at', direction: 'DESC'}]
    }

    return this.apollo.watchQuery<Message[]>({
      query: this.messageQueries.getMessages,
      variables: params ? params : _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.messages]))
  }

  /**
   * Get transaction list
   * @param params Variables by filters for query
   */
  getTransaction(params?: any): Observable<Transaction[]> {

    const _variables = {
      filter: {},
      limit: 50,
      orderBy:  [
        {path: 'now', direction: 'DESC'},
        {path: 'account_addr', direction: 'DESC'},
        {path: 'lt', direction: 'DESC'}
      ]
    }

    return this.apollo.watchQuery<Transaction[]>({
      query: this.transactionQueries.getTransaction,
      variables: params ? params : _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.transactions]))
  }
}
