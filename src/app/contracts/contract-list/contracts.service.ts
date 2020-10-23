import { Injectable } from '@angular/core';
import { ContractsServicesModule } from './contracts-services.module';
import { Apollo } from 'apollo-angular';
import { AccountQueries, CommonQueries } from '../../api/queries';
import { Observable, Subject } from 'rxjs';
import { Account, Transaction } from '../../api';
import { map } from 'rxjs/operators';
// import 'rxjs/add/operator/map';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: ContractsServicesModule
})
export class ContractsService {
  protected _unsubscribe = new Subject();

  constructor(
    private apollo: Apollo,
    private accountQueries: AccountQueries,
    private commonQueries: CommonQueries,
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
   * getAccountsTotalBalance
   */
  getGeneralData(): Observable<any>{
    return this.apollo.watchQuery<any>({
      query: this.commonQueries.getGeneralAccountData,
      variables: {},
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data))
  }

  /**
   * Get accounts list
   * @param params Variables by filters for query
   */
  getAccounts(params?: any): Observable<Account[]> {

    const _variables = {
      filter: {},
      limit: 50,
      orderBy:  [{path: "balance", direction: "DESC"}],
    }

    return this.apollo.watchQuery<Transaction[]>({
      query: this.accountQueries.getAccounts,
      variables: params ? params : _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.accounts]))
  }
}
