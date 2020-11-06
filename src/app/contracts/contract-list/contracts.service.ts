import { Injectable } from '@angular/core';
import { ContractsServicesModule } from './contracts-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { AccountQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Account, FilterSettings, SimpleDataFilter, ItemList } from 'src/app/api';
import { Observable, Subscriber } from 'rxjs';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: ContractsServicesModule
})
export class ContractsService extends BaseService<Account> {
  constructor(
    protected apollo: Apollo,
    public graphQueryService: AccountQueries,
    public baseFunctionsService: BaseFunctionsService,
  ) {
    super(
      apollo,
      graphQueryService,
      baseFunctionsService,
      (data: Account) => new Account(data),
      appRouteMap.contracts,
      appRouteMap.contract,
      () => {
        this._filterSettings = new FilterSettings({
          filterChain: true,
          filterExtInt: false,
          filterByShard: false,
          filterByTime: false,
          filterByAbort: false,
          filterByMinMax: true,
          filterByDate: true,
          filterByDirection: false,
        });
      }
    );
  }

  /**
   * Get variables
   * @param hash for query
   */
  public getVariablesForAggregateAccounts(params: SimpleDataFilter, hash: string, isBalanse: boolean = false, isType: boolean = false): object {
    params = params ? params : new SimpleDataFilter({});

    let _acc_type = isType
      ? {eq: 1}
      : undefined;

    let  _fields = isBalanse
      ? [{field: 'balance', fn: 'SUM'}]
      : undefined;

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
      fields: _fields,
      filter: {
        acc_type: _acc_type,
        balance: _balance,
        workchain_id: _workchain_id,
        last_paid: _last_paid,
        code_hash: {eq: hash}
      }
    };
  }

  /**
   * Get variables
   * @param hash for query
   */
  public getVariablesForAggregateMessages(params: SimpleDataFilter, hash: string): object {
    params = params ? params : new SimpleDataFilter({});

    let _created_at = params.fromDate != null || params.toDate != null
      ? {
        ge: params.fromDate != null ? Number(params.fromDate) : undefined,
        le: params.toDate != null ? Number(params.toDate) : undefined
      }
      : undefined;

    return {
      filter: {
        code_hash: {eq: hash},
        created_at: _created_at
      }
    };
  }

  /**
   * Contracts
   */
  public getAccounts(param?: any): Observable<ItemList<Account>> {
    const ctx = this;

    return new Observable((s: Subscriber<ItemList<Account>>) => {
      s.next(ctx.smartContractsMocks());
      s.complete();
    });
  }

  /**
   * Smart Contracts Mocks
   */
  private smartContractsMocks(): ItemList<Account> {
    return this.baseFunctionsService.smartContracts();
  }
}