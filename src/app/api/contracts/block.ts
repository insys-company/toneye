import { AccountBlock, BlockMaster, DataRef, MsgData, FlowData, ExtBlkRef } from '..';

export class Block {
  account_blocks: Array<AccountBlock>;
  after_merge: boolean;
  after_split: boolean;
  before_split: boolean;
  boc: string;
  end_lt: string;
  flags: number; //?
  gen_catchain_seqno: number;
  gen_software_capabilities: string;
  gen_software_version: number;
  gen_utime: number;
  gen_validator_list_hash_short: number;
  global_id: number;
  id: string;
  in_msg_descr: Array<MsgData>;
  master: BlockMaster;
  master_ref: DataRef;
  min_ref_mc_seqno: number;
  out_msg_descr: Array<MsgData>;
  prev_alt_ref: ExtBlkRef //?
  prev_key_block_seqno: number;
  prev_ref: DataRef;
  prev_vert_alt_ref: ExtBlkRef; //?
  prev_vert_ref: ExtBlkRef; //?
  rand_seed: string;
  seq_no: number;
  shard: string;
  start_lt: string;
  status: number;
  tr_count: number;
  value_flow: FlowData;
  version: number;
  vert_seq_no: number;
  want_merge: boolean;
  want_split: boolean;
  workchain_id: number;
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
      account_blocks: this.account_blocks,
      after_merge: this.after_merge,
      after_split: this.after_split,
      before_split: this.before_split,
      boc: this.boc,
      end_lt: this.end_lt,
      flags: this.flags,
      gen_catchain_seqno: this.gen_catchain_seqno,
      gen_software_capabilities: this.gen_software_capabilities,
      gen_software_version: this.gen_software_version,
      gen_utime: this.gen_utime,
      gen_validator_list_hash_short: this.gen_validator_list_hash_short,
      global_id: this.global_id,
      id: this.id,
      in_msg_descr: this.in_msg_descr,
      master: this.master,
      master_ref: this.master_ref,
      min_ref_mc_seqno: this.min_ref_mc_seqno,
      out_msg_descr: this.out_msg_descr,
      prev_alt_ref: this.prev_alt_ref,
      prev_key_block_seqno: this.prev_key_block_seqno,
      prev_ref: this.prev_ref,
      prev_vert_alt_ref: this.prev_vert_alt_ref,
      prev_vert_ref: this.prev_vert_ref,
      rand_seed: this.rand_seed,
      seq_no: this.seq_no,
      shard: this.shard,
      start_lt: this.start_lt,
      status: this.status,
      tr_count: this.tr_count,
      value_flow: this.value_flow,
      version: this.version,
      vert_seq_no: this.vert_seq_no,
      want_merge: this.want_merge,
      want_split: this.want_split,
      workchain_id: this.workchain_id,
      __typename: this.__typename,
    };
  }
}
