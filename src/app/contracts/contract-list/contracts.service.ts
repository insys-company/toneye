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
      s.next(ctx.mocks());
      s.complete();
    });
  }

  /**
   * Mocks
   */
  private mocks(): ItemList<Account> {
    return new ItemList<Account>({
      page: 0,
      pageSize: 25,
      total: 7,
      data: new Array<Account>(
        new Account({
          id: 'e2b60b6b602c10ced7ea8ede4bdf96342c97570a3798066f3fb50a4b2b27a208',
          code_hash: 'e2b60b6b602c10ced7ea8ede4bdf96342c97570a3798066f3fb50a4b2b27a208',
        }),
        new Account({
          id: '80d6c47c4a25543c9b397b71716f3fae1e2c5d247174c52e2c19bd896442b105',
          code_hash: '80d6c47c4a25543c9b397b71716f3fae1e2c5d247174c52e2c19bd896442b105',
        }),
        new Account({
          id: '207dc560c5956de1a2c1479356f8f3ee70a59767db2bf4788b1d61ad42cdad82',
          code_hash: '207dc560c5956de1a2c1479356f8f3ee70a59767db2bf4788b1d61ad42cdad82',
        }),
        new Account({
          id: '5daea8b855140d110ab07d430883bfecdd4cba9bcded8968fae7fa6cdb5adfbd',
          code_hash: '5daea8b855140d110ab07d430883bfecdd4cba9bcded8968fae7fa6cdb5adfbd',
        }),
        new Account({
          id: 'a572fb7ff94747da29e4b423b20a808c1342f7b491d20a2d47ebcc3eea8bc06c',
          code_hash: 'a572fb7ff94747da29e4b423b20a808c1342f7b491d20a2d47ebcc3eea8bc06c',
        }),
        new Account({
          id: '3afa6b0ac7fe37b73b5010e190d6853578c852c86428091ebd514f7e17b12415',
          code_hash: '3afa6b0ac7fe37b73b5010e190d6853578c852c86428091ebd514f7e17b12415',
        }),
        new Account({
          id: '35ce39cebd781b7d1f51cd620a615ef44c8020037fa13c758fd63d30341b29cc',
          code_hash: '35ce39cebd781b7d1f51cd620a615ef44c8020037fa13c758fd63d30341b29cc',
        })
      )
    });
  }
}