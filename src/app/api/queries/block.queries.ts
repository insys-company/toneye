import { Injectable } from '@angular/core';
import { BlockFragments } from '../fragments';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class BlockQueries {

  getBlocks = gql`
    query getBlocks($filter: BlockFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      blocks(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        id
        gen_utime
        seq_no
        shard
        tr_count
        workchain_id
        __typename
      }
    }
  `;

  getMasterBlock = gql`
    query getMasterBlock($filter: BlockFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      blocks(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        prev_key_block_seqno
        master {
          max_shard_gen_utime
          min_shard_gen_utime
          shard_hashes {
            shard
            descr {
              gen_utime
              __typename
            }
            workchain_id
            __typename
          }
          __typename
        }
        seq_no
        __typename
      }
    }
  `;

  getMasterBlockConfig = gql`
    query getMasterBlock($filter: BlockFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      blocks(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        prev_key_block_seqno
        master {

          # add Other
          max_shard_gen_utime
          min_shard_gen_utime
          shard_hashes {
            shard
            descr {
              gen_utime
              __typename
            }
            workchain_id
            __typename
          }
          __typename
        }
        seq_no
        __typename
      }
    }
  `;

  constructor(private blockFragments: BlockFragments) { }
}
