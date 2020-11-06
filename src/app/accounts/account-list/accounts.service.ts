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
          filterByDirection: false,
        });
      }
    );
  }

  /**
   * Variables for blocks
   * @param params Filter params
   */
  public getVariablesForAccounts(params: SimpleDataFilter, isParse: boolean = true, limit: number = 50): object {
    params = params ? params : new SimpleDataFilter({});

    let _balance = params.min != null || params.max != null
      ? {
        ge: params.min != null ? isParse ? this.baseFunctionsService.decimalToHex(params.min) : params.min : undefined,
        le: params.max != null ? isParse ?  this.baseFunctionsService.decimalToHex(params.max) : params.max : undefined
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
      limit: limit
    };
  }
}
