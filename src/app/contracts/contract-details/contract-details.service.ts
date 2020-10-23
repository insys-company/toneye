import { Injectable } from '@angular/core';
import { ContractDetailsServicesModule } from './contract-details-services.module';
import { Apollo } from 'apollo-angular';
import { AccountQueries } from '../../api/queries';
import { Observable } from 'rxjs';
import { Account } from '../../api';
import { map } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from '../../app-route-map';
import { DetailsService } from 'src/app/shared/components/app-details/app-details.service';
import { DocumentNode } from 'graphql';
import { BaseFunctionsService } from 'src/app/shared/services';

@Injectable({
  providedIn: ContractDetailsServicesModule
})
export class ContractDetailsService extends DetailsService<Account> {
  constructor(
    protected apollo: Apollo,
    protected graphQueryService: AccountQueries,
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
   * Get data
   * @param _variables for query
   * @param _graphQ for query
   */
  public getAggregateData(_variables: any, _graphQ: DocumentNode): Observable<any> {
    return this.apollo.watchQuery<any>({
      query: _graphQ,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data));
  }

  /**
   * Get data
   * @param _hash Code hash of contract
   */
  public getAccounts(_hash: string | number): Observable<Account[]> {

    const _variables = {
      filter: {code_hash: {eq: _hash}},
      orderBy: [
        {path: 'balance', direction: 'DESC'},
        {path: "seq_no", direction: "DESC"}
      ],
      limit: 50
    }

    return this.apollo.watchQuery<Account[]>({
      query: this.graphQueryService.getAccounts,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.accounts]));
  }
}
