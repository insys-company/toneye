import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { GraphQueryService } from 'src/app/shared/services';

@Injectable({
  providedIn: 'root'
})
export class TransactionQueries extends GraphQueryService {

  getItem = gql`
    query getTransaction($filter: TransactionFilter) {
      transactions(filter: $filter) {
        aborted
        account_addr
        action {
          action_list_hash
          msgs_created
          no_funds
          result_arg
          result_code
          skipped_actions
          spec_actions
          status_change
          success
          tot_actions
          total_action_fees
          total_fwd_fees
          total_msg_size_bits
          total_msg_size_cells
          valid
          __typename
        }
        balance_delta
        block_id
        boc
        compute {
          account_activated
          compute_type
          exit_arg
          exit_code
          gas_credit
          gas_fees
          gas_limit
          gas_used
          mode
          msg_state_used
          skipped_reason
          success
          vm_final_state_hash
          vm_init_state_hash
          vm_steps
          __typename
        }
        credit_first
        destroyed
        end_status
        id
        in_message {
          id
          block_id
        }
        in_msg
        installed
        lt
        new_hash
        now
        old_hash
        orig_status
        outmsg_cnt
        prev_trans_hash
        prev_trans_lt
        proof
        status
        storage {
          status_change
          storage_fees_collected
          storage_fees_due
          __typename
        }
        total_fees
        tr_type
        tt
        __typename
      }
    }
  `;

  getTransactions = gql`
    query getTransactions($filter: TransactionFilter, $orderBy: [QueryOrderBy], $limit: Int, $timeout: Float) {
      transactions(filter: $filter, orderBy: $orderBy, limit: $limit, timeout: $timeout) {
        aborted
        account_addr
        balance_delta
        block_id
        boc
        end_status
        id
        in_message {
          id
          block_id
        }
        in_msg
        lt
        new_hash
        now
        old_hash
        orig_status
        outmsg_cnt
        prev_trans_hash
        storage {
          status_change
          storage_fees_collected
          storage_fees_due
          __typename
        }
        tr_type
        __typename
      }
    }
  `;

  getTransaction = gql`
    query getTransaction($filter: TransactionFilter) {
      transactions(filter: $filter) {
        aborted
        account_addr
        action {
          action_list_hash
          msgs_created
          no_funds
          result_arg
          result_code
          skipped_actions
          spec_actions
          status_change
          success
          tot_actions
          total_action_fees
          total_fwd_fees
          total_msg_size_bits
          total_msg_size_cells
          valid
          __typename
        }
        balance_delta
        block_id
        boc
        compute {
          account_activated
          compute_type
          exit_arg
          exit_code
          gas_credit
          gas_fees
          gas_limit
          gas_used
          mode
          msg_state_used
          skipped_reason
          success
          vm_final_state_hash
          vm_init_state_hash
          vm_steps
          __typename
        }
        credit_first
        destroyed
        end_status
        id
        in_message {
          id
          block_id
        }
        in_msg
        installed
        lt
        new_hash
        now
        old_hash
        orig_status
        outmsg_cnt
        prev_trans_hash
        prev_trans_lt
        proof
        status
        storage {
          status_change
          storage_fees_collected
          storage_fees_due
          __typename
        }
        total_fees
        tr_type
        tt
        __typename
      }
    }
  `;

  constructor() { super(); }
}
