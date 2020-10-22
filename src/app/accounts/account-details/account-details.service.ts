import { Injectable } from '@angular/core';
import { AccountDetailsServicesModule } from './account-details-services.module';
import { Apollo } from 'apollo-angular';
import { AccountQueries, TransactionQueries, MessageQueries } from '../../api/queries';
import { Observable } from 'rxjs';
import { Account, Transaction, Message } from '../../api';
import { map } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from '../../app-route-map';
import { DetailsService } from 'src/app/shared/components/app-details/app-details.service';

@Injectable({
  providedIn: AccountDetailsServicesModule
})
export class AccountDetailsService extends DetailsService<Account> {
  constructor(
    protected apollo: Apollo,
    protected graphQueryService: AccountQueries,
    private messageQueries: MessageQueries,
    private transactionQueries: TransactionQueries,
  ) {

    super(
      apollo,
      graphQueryService,
      (data: Account) => new Account(data),
      appRouteMap.accounts
    );

  }

  /**
   * Get data
   * @param _id Id of model
   */
  getTransactions(_id: string | number): Observable<Transaction[]> {

    const _variables = {
      filter: {account_addr: { eq: _id}},
      orderBy: [
        {path: 'now', direction: 'DESC'},
        {path: 'account_addr', direction: 'DESC'},
        {path: 'lt', direction: 'DESC'}
      ],
      limit: 50
    }

    return this.apollo.watchQuery<Transaction[]>({
      query: this.transactionQueries.getTransactions,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.transactions]))
  }

  /**
   * Get data
   * @param params _id Id of currently model
   */
  getMessages(_id: string | number): Observable<Message[]> {

    const _variables = {
      filter: {src: {eq: _id}},
      orderBy: [
        {path: 'gen_utime', direction: 'DESC'},
        {path: "seq_no", direction: "DESC"}
      ],
      limit: 50
    }

    return this.apollo.watchQuery<Message[]>({
      query: this.messageQueries.getMessages,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.messages]))
  }
}
