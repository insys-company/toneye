import { Injectable } from '@angular/core';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class MessageQueries {

  getMessages = gql`
    query getMessages($filter: MessageFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      messages(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        created_at
        created_lt
        dst
        id
        src
        value
        msg_type
        ihr_fee
        fwd_fee
        bounce
        bounced
        boc
        __typename
      }
    }
  `;

  constructor() { }
}
