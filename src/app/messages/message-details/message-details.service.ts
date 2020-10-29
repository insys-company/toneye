import { Injectable } from '@angular/core';
import { MessageDetailsServicesModule } from './message-details-services.module';
import { BaseService } from 'src/app/shared/components/app-base/app-base.service';
import { Apollo } from 'apollo-angular';
import { MessageQueries } from '../../api/queries';
import { BaseFunctionsService } from 'src/app/shared/services';
import { Message, FilterSettings } from 'src/app/api';
import { appRouteMap } from '../../app-route-map';

@Injectable({
  providedIn: MessageDetailsServicesModule
})
export class MessageDetailsService extends BaseService<Message> {
  constructor(
    protected apollo: Apollo,
    public graphQueryService: MessageQueries,
    public baseFunctionsService: BaseFunctionsService,
  ) {
    super(
      apollo,
      graphQueryService,
      baseFunctionsService,
      (data: Message) => new Message(data),
      appRouteMap.messages,
      appRouteMap.message,
      () => {
        this._filterSettings = new FilterSettings({
          filterChain: false,
          filterExtInt: false,
          filterByShard: false,
          filterByTime: false,
          filterByAbort: false,
          filterByMinMax: false,
          filterByDate: false,
          filterByDirection: false,
        });
      }
    );
  }

  /**
   * Get variables
   * @param _id Id for query
   */
  public getVariablesForInMsgs(_id: string | number): object {
    return {filter: {in_msg: { eq: _id}}};
  }

  /**
   * Get variables
   * @param _id Id for query
   */
  public getVariablesForOutMsgs(_id: string | number): object {
    return {filter: {out_msgs: {any: {eq: _id}}}};
  }
}
