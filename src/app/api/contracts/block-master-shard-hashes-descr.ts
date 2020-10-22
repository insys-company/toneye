export class BlockMasterShardHashesDescr {
  before_merge: boolean;
  before_split: boolean;
  end_lt: string;
  fees_collected: string;
  file_hash: string;
  flags: number;
  funds_created: string;
  gen_utime: number;
  min_ref_mc_seqno: number;
  next_catchain_seqno: number;
  next_validator_shard: string;
  nx_cc_updated: boolean;
  reg_mc_seqno: number;
  root_hash: string;
  seq_no: number;
  split: number; //?
  split_type: number; //?
  split_type_name: string; //?
  start_lt: string;
  want_merge: boolean;
  want_split: boolean;
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
      gen_utime: this.gen_utime,
      __typename: this.__typename,
    };
  }
}
