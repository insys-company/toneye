import { Injectable } from '@angular/core';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class TransactionQueries {

  getTransaction = gql`
    query getTransaction($filter: TransactionFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      transactions(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        account_addr
        balance_delta
        block_id
        id
        in_message {
          id
          block_id
        }
        in_msg
        now
        tr_type
        prev_trans_hash
        lt
        outmsg_cnt
        orig_status
        end_status
        old_hash
        new_hash
        aborted
        boc
        storage {
          status_change
          storage_fees_collected
          storage_fees_due
          __typename
        }
        __typename
      }
    }
  `;

  constructor() { }
}
