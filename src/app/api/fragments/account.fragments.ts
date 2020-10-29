import { Injectable } from '@angular/core';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class AccountFragments {
  _accountFragment = gql`
    fragment AccountFragment on Account {
      id
      balance
      last_paid
      __typename
    }
  `;

  constructor() {}
}
