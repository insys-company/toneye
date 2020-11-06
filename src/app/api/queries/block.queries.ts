import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { GraphQueryService } from 'src/app/shared/services';

@Injectable({
  providedIn: 'root'
})
export class BlockQueries extends GraphQueryService {

  // All data
  getItem = gql`
    query getBlock($filter: BlockFilter) {
      blocks(filter: $filter) {
        account_blocks {
          account_addr
          new_hash
          old_hash
          tr_count
          transactions {
            lt
            total_fees
            transaction_id
            __typename
            __typename
          }
          __typename
        }
        after_merge
        after_split
        before_split
        boc
        end_lt
        flags
        gen_catchain_seqno
        gen_software_capabilities
        gen_software_version
        gen_utime
        gen_validator_list_hash_short
        global_id
        id
        in_msg_descr {
          fwd_fee
          ihr_fee
          in_msg {
            cur_addr
            fwd_fee_remaining
            msg_id
            next_addr
            __typename
          }
          msg_id
          msg_type
          msg_type_name
          out_msg {
            cur_addr
            fwd_fee_remaining
            msg_id
            next_addr
            __typename
          }
          proof_created
          proof_delivered
          transaction_id
          transit_fee
          __typename
        }
        master {
          config {
            p15 {
              validators_elected_for
              elections_start_before
              elections_end_before
              stake_held_for
            }
            p16 {
              max_main_validators
              max_validators
	            min_validators
            }
            p17 {
              min_stake
              max_stake
              min_total_stake
              max_stake_factor
            }
            p32 {
              utime_since
              utime_since_string
              utime_until
              utime_until_string
              total
              total_weight
              list {
                adnl_addr
                public_key
                weight
              }
            }
            p34 {
              utime_since
              utime_since_string
              utime_until
              utime_until_string
              total
              total_weight
              list {
                adnl_addr
                public_key
                weight
              }
            }
            p36 {
              utime_since
              utime_since_string
              utime_until
              utime_until_string
              total
              total_weight
              list {
                adnl_addr
                public_key
                weight
              }
            }
          }
          config_addr
          max_shard_gen_utime
          min_shard_gen_utime
          recover_create_msg {
            fwd_fee
            ihr_fee
            in_msg {
              cur_addr
              fwd_fee_remaining
              msg_id
              next_addr
              __typename
            }
            msg_id
            msg_type
            msg_type_name
            out_msg {
              cur_addr
              fwd_fee_remaining
              msg_id
              next_addr
              __typename
            }
            proof_created
            proof_delivered
            transaction_id
            transit_fee
            __typename
          }
          shard_fees {
            create
            fees
            shard
            workchain_id
            __typename
          }
          shard_hashes {
            descr {
              before_merge
              before_split
              end_lt
              fees_collected
              file_hash
              flags
              funds_created
              gen_utime
              min_ref_mc_seqno
              next_catchain_seqno
              next_validator_shard
              nx_cc_updated
              reg_mc_seqno
              root_hash
              seq_no
              split
              split_type
              split_type_name
              start_lt
              want_merge
              want_split
              __typename
            }
            shard
            workchain_id
            __typename
          }
          __typename
        }
        master_ref {
          end_lt
          file_hash
          root_hash
          seq_no
          __typename
        }
        min_ref_mc_seqno
        out_msg_descr {
          __typename
        }
        prev_alt_ref {
          __typename
        }
        prev_key_block_seqno
        prev_ref {
          end_lt
          file_hash
          root_hash
          seq_no
          __typename
        }
        prev_vert_alt_ref {
          __typename
        }
        prev_vert_ref {
          __typename
        }
        rand_seed
        seq_no
        shard
        start_lt
        status
        tr_count
        value_flow {
          created
          exported
          fees_collected
          fees_imported
          from_prev_blk
          imported
          minted
          to_next_blk
          __typename
        }
        version
        vert_seq_no
        want_merge
        want_split
        workchain_id
        __typename
      }
    }
  `;

  getListForExport = gql`
    query getBlocks($filter: BlockFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      blocks(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        account_blocks {
          account_addr
          new_hash
          old_hash
          tr_count
          transactions {
            lt
            total_fees
            transaction_id
            __typename
            __typename
          }
          __typename
        }
        after_merge
        after_split
        before_split
        boc
        end_lt
        flags
        gen_catchain_seqno
        gen_software_capabilities
        gen_software_version
        gen_utime
        gen_validator_list_hash_short
        global_id
        id
        in_msg_descr {
          fwd_fee
          ihr_fee
          in_msg {
            cur_addr
            fwd_fee_remaining
            msg_id
            next_addr
            __typename
          }
          msg_id
          msg_type
          msg_type_name
          out_msg {
            cur_addr
            fwd_fee_remaining
            msg_id
            next_addr
            __typename
          }
          proof_created
          proof_delivered
          transaction_id
          transit_fee
          __typename
        }
        master {
          config {
            p15 {
              validators_elected_for
              elections_start_before
              elections_end_before
              stake_held_for
            }
            p16 {
              max_main_validators
              max_validators
	            min_validators
            }
            p17 {
              min_stake
              max_stake
              min_total_stake
              max_stake_factor
            }
            p32 {
              utime_since
              utime_since_string
              utime_until
              utime_until_string
              total
              total_weight
              list {
                adnl_addr
                public_key
                weight
              }
            }
            p34 {
              utime_since
              utime_since_string
              utime_until
              utime_until_string
              total
              total_weight
              list {
                adnl_addr
                public_key
                weight
              }
            }
            p36 {
              utime_since
              utime_since_string
              utime_until
              utime_until_string
              total
              total_weight
              list {
                adnl_addr
                public_key
                weight
              }
            }
          }
          config_addr
          max_shard_gen_utime
          min_shard_gen_utime
          recover_create_msg {
            fwd_fee
            ihr_fee
            in_msg {
              cur_addr
              fwd_fee_remaining
              msg_id
              next_addr
              __typename
            }
            msg_id
            msg_type
            msg_type_name
            out_msg {
              cur_addr
              fwd_fee_remaining
              msg_id
              next_addr
              __typename
            }
            proof_created
            proof_delivered
            transaction_id
            transit_fee
            __typename
          }
          shard_fees {
            create
            fees
            shard
            workchain_id
            __typename
          }
          shard_hashes {
            descr {
              before_merge
              before_split
              end_lt
              fees_collected
              file_hash
              flags
              funds_created
              gen_utime
              min_ref_mc_seqno
              next_catchain_seqno
              next_validator_shard
              nx_cc_updated
              reg_mc_seqno
              root_hash
              seq_no
              split
              split_type
              split_type_name
              start_lt
              want_merge
              want_split
              __typename
            }
            shard
            workchain_id
            __typename
          }
          __typename
        }
        master_ref {
          end_lt
          file_hash
          root_hash
          seq_no
          __typename
        }
        min_ref_mc_seqno
        out_msg_descr {
          __typename
        }
        prev_alt_ref {
          __typename
        }
        prev_key_block_seqno
        prev_ref {
          end_lt
          file_hash
          root_hash
          seq_no
          __typename
        }
        prev_vert_alt_ref {
          __typename
        }
        prev_vert_ref {
          __typename
        }
        rand_seed
        seq_no
        shard
        start_lt
        status
        tr_count
        value_flow {
          created
          exported
          fees_collected
          fees_imported
          from_prev_blk
          imported
          minted
          to_next_blk
          __typename
        }
        version
        vert_seq_no
        want_merge
        want_split
        workchain_id
        __typename
      }
    }
  `;


  getBlocks = gql`
    query getBlocks($filter: BlockFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      blocks(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        gen_utime
        id
        seq_no
        shard
        tr_count
        workchain_id
        __typename
      }
    }
  `;

  getBlocksSignatures = gql`
    query gatBlocksSignatures($filter: BlockSignaturesFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      blocks_signatures(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        gen_utime
        id
        __typename
      }
    }
  `;

  getMasterBlockPrevKey = gql`
    query getMasterBlockPrevKey($filter: BlockFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      blocks(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        prev_key_block_seqno
        seq_no
        __typename
      }
    }
  `;

  getMasterBlockShard = gql`
    query getMasterBlockShard($filter: BlockFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      blocks(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        master {
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

  getMasterBlock = gql`
    query getMasterBlock($filter: BlockFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      blocks(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        prev_key_block_seqno
        master {
          max_shard_gen_utime
          min_shard_gen_utime
          recover_create_msg {
            fwd_fee
            ihr_fee
            in_msg {
              cur_addr
              fwd_fee_remaining
              msg_id
              next_addr
              __typename
            }
            msg_id
            msg_type
            msg_type_name
            out_msg {
              cur_addr
              fwd_fee_remaining
              msg_id
              next_addr
              __typename
            }
            proof_created
            proof_delivered
            transaction_id
            transit_fee
            __typename
          }
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
    query getMasterBlockConfig($filter: BlockFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      blocks(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        prev_key_block_seqno
        master {
          config {
            p15 {
              validators_elected_for
              elections_start_before
              elections_end_before
              stake_held_for
            }
            p16 {
              max_main_validators
              max_validators
	            min_validators
            }
            p17 {
              min_stake
              max_stake
              min_total_stake
              max_stake_factor
            }
            p32 {
              utime_since
              utime_since_string
              utime_until
              utime_until_string
              total
              total_weight
              list {
                adnl_addr
                public_key
                weight
              }
            }
            p34 {
              utime_since
              utime_since_string
              utime_until
              utime_until_string
              total
              total_weight
              list {
                adnl_addr
                public_key
                weight
              }
            }
            p36 {
              utime_since
              utime_since_string
              utime_until
              utime_until_string
              total
              total_weight
              list {
                adnl_addr
                public_key
                weight
              }
            }
          }
          config_addr
          max_shard_gen_utime
          min_shard_gen_utime
          shard_hashes {
            descr {
              before_merge
              before_split
              end_lt
              fees_collected
              file_hash
              flags
              funds_created
              gen_utime
              min_ref_mc_seqno
              next_catchain_seqno
              next_validator_shard
              nx_cc_updated
              reg_mc_seqno
              root_hash
              seq_no
              split
              split_type
              split_type_name
              start_lt
              want_merge
              want_split
              __typename
            }
            shard
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

  constructor() { super(); }
}
