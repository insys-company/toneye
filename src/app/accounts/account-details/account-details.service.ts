import { Injectable } from '@angular/core';
import { AccountDetailsServicesModule } from './account-details-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { AccountQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Account, FilterSettings, SimpleDataFilter } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: AccountDetailsServicesModule
})
export class AccountDetailsService extends BaseService<Account> {
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
      appRouteMap.accounts,
      appRouteMap.account,
      () => {
        this._filterSettings = new FilterSettings({
          filterChain: false,
          filterExtInt: false,
          filterByShard: false,
          filterByTime: false,
          filterByAbort: true,
          filterByMinMax: true,
          filterByDate: true,
          filterByDirection: false,
        });
      }
    );
  }

  /**
   * Get variables
   * @param _id Id for query
   */
  public getVariablesForTransactions(params: SimpleDataFilter, _id: string, limit: number = null): object {
    params = params ? params : new SimpleDataFilter({});

    let _balance_delta = params.min != null || params.max != null
      ? {
        ge: params.min != null ? this.baseFunctionsService.decimalToHex(params.min) : undefined,
        le: params.max != null ? this.baseFunctionsService.decimalToHex(params.max) : undefined
      }
      : undefined;

    let _now = params.fromDate != null || params.toDate != null
      ? {
        ge: params.fromDate != null ? Number(params.fromDate) : undefined,
        le: params.toDate != null ? Number(params.toDate) : undefined
      }
      : undefined;

    let _workchain_id = params.chain != null
      ? { eq:  Number(params.chain) }
      : undefined;

    let _aborted = params.aborted != null
      ? { eq:  Boolean(params.aborted) }
      : undefined;

    return {
      filter: {
        account_addr: {eq: _id},
        aborted: _aborted,
        workchain_id: _workchain_id,
        balance_delta: _balance_delta,
        now: _now,
      },
      orderBy: [
        {path: 'now', direction: 'DESC'},
        {path: 'account_addr', direction: 'DESC'},
        {path: 'lt', direction: 'DESC'}
      ],
      limit: limit != null ? limit : 50
    };
  }

  public getVariablesForMessages(params: SimpleDataFilter, _id: string, srcTypeMess: boolean = null, limit: number = null): object {
    params = params ? params : new SimpleDataFilter({});

    let id = params.chain != null && !_id.match(`${params.chain}:`) ? {eq: null} : undefined;

    let _dst: object;

    let _src: object;

    // Только по src
    if (params.msg_direction == 'src' || srcTypeMess  + '' == 'true') {

      _src = id
        ? undefined
        : { eq: _id };

      _dst = id
        ? undefined 
        : params.ext_int == 'ext'
          ? { eq: '' }
          : undefined;

    }
    // Только по dst
    else if (params.msg_direction == 'dst' || srcTypeMess  + '' == 'false') {

      _dst = id
        ? undefined
        : { eq: _id };

        _src = id
        ? undefined 
        : params.ext_int == 'ext'
          ? { eq: '' }
          : undefined;
    }

    let _value = params.min != null || params.max != null
      ? {
        ge: params.min != null ? this.baseFunctionsService.decimalToHex(params.min) : undefined,
        le: params.max != null ? this.baseFunctionsService.decimalToHex(params.max) : undefined
      }
      : undefined;

    let _created_at = params.fromDate != null || params.toDate != null
      ? {
        ge: params.fromDate != null ? Number(params.fromDate) : undefined,
        le: params.toDate != null ? Number(params.toDate) : undefined
      }
      : undefined;

    let _msg_type = params.ext_int == 'int'
      ? { eq: 0 }
      : undefined;

    return {
      filter: {
        id: id,
        dst: _dst,
        src: _src,
        msg_type: _msg_type,
        value: _value,
        created_at: _created_at,
      },
      orderBy: [
        {path: 'created_at', direction: 'DESC'}
      ],
      limit: limit != null ? limit : 50
    };
  }

  // /**
  //  * Get variables
  //  * @param _id Id for query
  //  */
  // public getVariablesForMessages(params: SimpleDataFilter, _id: string): object {
  //   params = params ? params : new SimpleDataFilter({});

  //   return {
  //     filter: {src: {eq: _id}},
  //     orderBy: [
  //       {path: 'gen_utime', direction: 'DESC'},
  //       {path: 'seq_no', direction: 'DESC'}
  //     ],
  //     limit: 50
  //   };
  // }
}
