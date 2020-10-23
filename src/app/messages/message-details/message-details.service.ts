import { Injectable } from '@angular/core';
import { MessageDetailsServicesModule } from './message-details-services.module';
import { Apollo } from 'apollo-angular';
import { TransactionQueries, MessageQueries } from '../../api/queries';
import { Observable } from 'rxjs';
import { Message, Transaction } from '../../api';
import { map } from 'rxjs/operators';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from '../../app-route-map';
import { DetailsService } from 'src/app/shared/components/app-details/app-details.service';
import { BaseFunctionsService } from 'src/app/shared/services';

@Injectable({
  providedIn: MessageDetailsServicesModule
})
export class MessageDetailsService extends DetailsService<Message> {

  constructor(
    protected apollo: Apollo,
    protected graphQueryService: MessageQueries,
    public baseFunctionsService: BaseFunctionsService,
    private transactionQueries: TransactionQueries,
  ) {

    super(
      apollo,
      graphQueryService,
      baseFunctionsService,
      (data: Message) => new Message(data),
      appRouteMap.messages
    );

  }

  /**
   * Get data
   * @param _id Id of model
   * @param isInMsg for query
   */
  public getTransaction(_id: string | number, isInMsg: boolean = false): Observable<Transaction[]> {

    const _variables = {
      filter: isInMsg ? {in_msg: { eq: _id}} : {out_msgs: {any: {eq: _id}}},
    }

    return this.apollo.watchQuery<Transaction[]>({
      query: this.transactionQueries.getTransaction,
      variables: _variables,
      errorPolicy: 'all'
    })
    .valueChanges
    .pipe(takeUntil(this._unsubscribe), map(res => res.data[appRouteMap.transactions]))
  }
}
