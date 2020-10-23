import { Injectable } from "@angular/core";
import gql from 'graphql-tag';
import { GraphQueryService } from 'src/app/shared/services';
// import...

@Injectable({
  providedIn: 'root'
})
export class AccountQueries extends GraphQueryService {

  // All data
  getItem = gql`
    query getAccounts($filter: AccountFilter) {
      accounts(filter: $filter) {
        acc_type
        balance
        boc
        code
        code_hash
        data
        data_hash
        due_payment
        id
        last_paid
        last_trans_lt
        library
        library_hash
        proof
        tick
        tock
        __typename
      }
    }
  `;

  getAccounts = gql`
    query getAccounts($filter: AccountFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      accounts(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        balance
        id
        last_paid
        __typename
      }
    }
  `;

  constructor() { super(); }
}