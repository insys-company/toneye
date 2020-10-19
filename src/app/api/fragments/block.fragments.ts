import { Injectable } from '@angular/core';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class BlockFragments {
  _blockListFragment = gql`
    fragment BlockListFragment on Block {
      id
      gen_utime
      seq_no
      shard
      tr_count
      workchain_id
      __typename
    }
  `;

  constructor() {}
}
