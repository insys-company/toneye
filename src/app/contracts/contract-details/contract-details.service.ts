import { Injectable } from '@angular/core';
import { ContractDetailsServicesModule } from './contract-details-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { AccountQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Account } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: ContractDetailsServicesModule
})
export class ContractDetailsService extends BaseService<Account> {
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
      appRouteMap.accounts
    );
  }

  /**
   * Get variables
   * @param _hash Code hash of contract
   */
  public getVariablesForAccounts(_hash: string | number): object {
    return {
      filter: {code_hash: {eq: _hash}},
      orderBy: [
        {path: 'balance', direction: 'DESC'},
        {path: 'seq_no', direction: 'DESC'}
      ],
      limit: 50
    };
  }

  /**
   * Get variables
   * @param _hash Code hash of contract
   */
  public getVariablesForBalance(_hash: string | number): object {
    return {
      filter: {code_hash: {eq: _hash}},
      orderBy: [
        {path: 'balance', direction: 'DESC'},
        {path: 'seq_no', direction: 'DESC'}
      ],
      fields: [{field: 'balance', fn: 'SUM'}],
      limit: 50
    };
  }

  /**
   * Get variables
   * @param _hash Code hash of contract
   */
  public getVariablesForDeployedContracts(_hash: string | number): object {
    return {filter: {code_hash: {eq: _hash}, acc_type: {eq: 1}}};
  }

  /**
   * Get variables
   * @param _hash Code hash of contract
   */
  public getVariablesForContracts(_hash: string | number): object {
    return {filter: {code_hash: {eq: _hash}}};
  }
}
