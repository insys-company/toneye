import { Injectable } from '@angular/core';
import { ContractsServicesModule } from './contracts-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { AccountQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Account } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

// const HASH="80d6c47c4a25543c9b397b71716f3fae1e2c5d247174c52e2c19bd896442b105";
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
      appRouteMap.accounts, // на валидаторах работа с мастер блоком
      null,
      () => {
        // this._filterSettings = new FilterSettings({
        //   filterVisible: true,
        //   filterByCountry: true,
        //   filterByStatus: true,
        //   filterBySearch: true,
        //   enableDefaultStatus: true,
        // });
      }
    );
  }

  /**
   * Get variables
   * @param hash for query
   */
  public getVariablesForAggregateAccountsByBalance(hash: string | number): object {
    return {fields: [{field: 'balance', fn: 'SUM'}], filter: {code_hash: {eq: hash}}};
  }

  /**
   * Get variables
   * @param hash for query
   */
  public getVariablesForAggregateAccountsByType(hash: string | number): object {
    return {filter: { acc_type: {eq: 1}, code_hash: {eq: hash}}};
  }

  /**
   * Get variables
   * @param hash for query
   */
  public getVariablesForAggregateAccountsByHash(hash: string | number): object {
    return { filter: { code_hash: {eq: hash}}};
  }

  /**
   * Get variables
   * @param hash for query
   */
  public getVariablesForAggregateMessages(hash: string | number): object {
    return {filter: { code_hash: {eq: hash}}};
  }
}
