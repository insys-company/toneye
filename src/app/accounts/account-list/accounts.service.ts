import { Injectable } from '@angular/core';
import { AccountsServicesModule } from './accounts-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { MessageQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Account, FilterSettings, SimpleDataFilter } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: AccountsServicesModule
})
export class AccountsService extends BaseService<Account> {
  constructor(
    protected apollo: Apollo,
    public graphQueryService: MessageQueries,
    public baseFunctionsService: BaseFunctionsService,
  ) {
    super(
      apollo,
      graphQueryService,
      baseFunctionsService,
      (data: Account) => new Account(data),
      appRouteMap.accounts,
      appRouteMap.account,
      () => {
        this._filterSettings = new FilterSettings({
          filterChain: true,
          filterExtInt: false,
          filterByShard: false,
          filterByTime: false,
          filterByAbort: false,
          filterByMinMax: true,
          filterByDate: true,
        });
      }
    );
  }

  /**
   * Variables for blocks
   * @param params Filter params
   */
  public getVariablesForAccounts(params: SimpleDataFilter): object {
    params = params ? params : new SimpleDataFilter({});

    let _balance = params.min != null || params.max != null
      ? {
        ge: params.min != null ? this.baseFunctionsService.decimalToHex(params.min) : undefined,
        le: params.max != null ? this.baseFunctionsService.decimalToHex(params.max) : undefined
      }
      : undefined;

    let _workchain_id = params.chain != null
      ? { eq:  Number(params.chain) }
      : undefined;

    let _last_paid = params.fromDate != null || params.toDate != null
      ? {
        ge: params.fromDate != null ? Number(params.fromDate) : undefined,
        le: params.toDate != null ? Number(params.toDate) : undefined
      }
      : undefined;

    return {
      filter: {
        workchain_id: _workchain_id,
        balance: _balance,
        last_paid: _last_paid
      },
      orderBy: [{path: 'balance', direction: 'DESC'}],
      limit: 50
    };
  }

  // constructor(
  //   private apollo: Apollo,
  //   private accountQueries: AccountQueries,
  //   private commonQueries: CommonQueries,
  // ) {
  //   // TODO
  // }

  // ngUnsubscribe(): void {
  //   this._unsubscribe.next();
  //   this._unsubscribe.complete();
  // }

  // /**
  //  * Get general information
  //  *
  //  * queries:
  //  * getAccountsCount
  //  * getAccountsTotalBalance
  //  */
  // getGeneralData(): Observable<any>{
  //   return this.apollo.watchQuery<any>({
  //     query: this.commonQueries.getGeneralAccountData,
  //     variables: {},
  //     errorPolicy: 'all'
  //   })
  //   .valueChanges
  //   .pipe(takeUntil(this._unsubscribe), map(res => res.data))
  // }

  // /**
  //  * Get accounts list
  //  * @param params Variables by filters for query
  //  */
  // getAccounts(params?: any): Observable<Account[]> {

  //   const _variables = {
  //     filter: {},
  //     limit: 50,
  //     orderBy:  [{path: "balance", direction: "DESC"}],
  //   }

  //   return this.apollo.watchQuery<Transaction[]>({
  //     query: this.accountQueries.getAccounts,
  //     variables: params ? params : _variables,
  //     errorPolicy: 'all'
  //   })
  //   .valueChanges
  //   .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.accounts]))
  // }
}
