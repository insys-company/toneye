import { InMsg } from '..';

export class Transaction {
  aborted: boolean;
  account_addr: string;
  action: Action;
  balance_delta: string;
  block_id: string;
  boc: string;
  bounce: string;
  compute: Compute;
  credit: string;
  credit_first: string;
  destroyed: boolean;
  end_status: number;
  id: string;
  in_message: InMsg;
  in_msg: string;
  installed: boolean;
  lt: string;
  new_hash: string;
  now: number;
  old_hash: string;
  orig_status: number;
  outmsg_cnt: number;
  prev_trans_hash: string;
  prev_trans_lt: string;
  proof: string;
  split_info: string;
  status: number;
  storage: Storage;
  total_fees: string;
  tr_type: number;
  tt: string;
  __typename: string;

  constructor(data?: any) {
    if (data) {
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          this[i] = data[i];
        }
      }
    }
  }

  serialize() {
    return {
      account_addr: this.account_addr,
      balance_delta: this.balance_delta,
      block_id: this.block_id,
      id: this.id,
      in_message: this.in_message,
      in_msg: this.in_msg,
      now: this.now,
      tr_type: this.tr_type,
      prev_trans_hash: this.prev_trans_hash,
      lt: this.lt,
      outmsg_cnt: this.outmsg_cnt,
      orig_status: this.orig_status,
      end_status: this.end_status,
      old_hash: this.old_hash,
      new_hash: this.new_hash,
      aborted: this.aborted,
      boc: this.boc,
      storage: this.storage,
      __typename: this.__typename,
    };
  }
}

export class Compute {
  account_activated: boolean;
  compute_type: number;
  exit_arg: string;
  exit_code: number;
  gas_credit: string;
  gas_fees: string;
  gas_limit: string;
  gas_used: string;
  mode: number;
  msg_state_used: boolean;
  skipped_reason: string;
  success: boolean;
  vm_final_state_hash: string;
  vm_init_state_hash: string;
  vm_steps: number;
  __typename: string;

  constructor(data?: any) {
    if (data) {
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          this[i] = data[i];
        }
      }
    }
  }

  serialize() {
    return {
      account_activated: this.account_activated,
      compute_type: this.compute_type,
      exit_arg: this.exit_arg,
      exit_code: this.exit_code,
      gas_credit: this.gas_credit,
      gas_fees: this.gas_fees,
      gas_limit: this.gas_limit,
      gas_used: this.gas_used,
      mode: this.mode,
      msg_state_used: this.msg_state_used,
      skipped_reason: this.skipped_reason,
      success: this.success,
      vm_final_state_hash: this.vm_final_state_hash,
      vm_init_state_hash: this.vm_init_state_hash,
      vm_steps: this.vm_steps,
      __typename: this.__typename,
    };
  }
}

export class Storage {
  status_change: number;
  storage_fees_collected: string;
  storage_fees_due: string;
  __typename: string;

  constructor(data?: any) {
    if (data) {
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          this[i] = data[i];
        }
      }
    }
  }

  serialize() {
    return {
      status_change: this.status_change,
      storage_fees_collected: this.storage_fees_collected,
      storage_fees_due: this.storage_fees_due,
      __typename: this.__typename,
    };
  }
}

export class Action {
  action_list_hash: string;
  msgs_created: number;
  no_funds: boolean;
  result_arg: string;
  result_code: number;
  skipped_actions: number;
  spec_actions: number;
  status_change: number;
  success: boolean;
  tot_actions: number;
  total_action_fees: string;
  total_fwd_fees: string;
  total_msg_size_bits: string;
  total_msg_size_cells: string;
  valid: boolean;
  __typename: string;

  constructor(data?: any) {
    if (data) {
      for (const i in data) {
        if (data.hasOwnProperty(i)) {
          this[i] = data[i];
        }
      }
    }
  }

  serialize() {
    return {
      action_list_hash: this.action_list_hash,
      msgs_created: this.msgs_created,
      no_funds: this.no_funds,
      result_arg: this.result_arg,
      result_code: this.result_code,
      skipped_actions: this.skipped_actions,
      spec_actions: this.spec_actions,
      status_change: this.status_change,
      success: this.success,
      tot_actions: this.tot_actions,
      total_action_fees: this.total_action_fees,
      total_fwd_fees: this.total_fwd_fees,
      total_msg_size_bits: this.total_msg_size_bits,
      total_msg_size_cells: this.total_msg_size_cells,
      valid: this.valid,
      __typename: this.__typename,
    };
  }
}