import { Injectable } from '@angular/core';
import { AccountDetailsServicesModule } from './account-details-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { AccountQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Account } from 'src/app/api';
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
      appRouteMap.accounts
    );
  }

  /**
   * Get variables
   * @param _id Id for query
   */
  public getVariablesForTransactions(_id: string | number): object {
    return {
      filter: {account_addr: {eq: _id}},
      orderBy: [
        {path: 'now', direction: 'DESC'},
        {path: 'account_addr', direction: 'DESC'},
        {path: 'lt', direction: 'DESC'}
      ],
      limit: 50
    };
  }

  /**
   * Get variables
   * @param _id Id for query
   */
  public getVariablesForMessages(_id: string | number): object {
    return {
      filter: {src: {eq: _id}},
      orderBy: [
        {path: 'gen_utime', direction: 'DESC'},
        {path: 'seq_no', direction: 'DESC'}
      ],
      limit: 50
    };
  }
}
