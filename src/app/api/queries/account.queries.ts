import { Injectable } from "@angular/core";
import gql from 'graphql-tag';
// import...

@Injectable({
  providedIn: 'root'
})
export class AccountQueries {

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

  constructor() { }
}