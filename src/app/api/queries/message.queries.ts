import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { GraphQueryService } from 'src/app/shared/services';

@Injectable({
  providedIn: 'root'
})
export class MessageQueries extends GraphQueryService {

  // All data
  getItem = gql`
    query getMessage($filter: MessageFilter) {
      messages(filter: $filter) {
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

  getData = gql`
    query getData($filter1: MessageFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float, $filter2: MessageFilter, $fields: [FieldAggregation]) {
      messages(filter: $filter1, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
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

      aggregateMessages(filter: $filter2, fields: $fields)
    }
  `;

  constructor() { super(); }
}
