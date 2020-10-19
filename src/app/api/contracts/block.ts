import { BlockMaster } from '..';

export class Block {
  id: string;
  gen_utime: number;
  master: BlockMaster;
  prev_key_block_seqno: number;
  seq_no: number;
  shard: string;
  tr_count: number;
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
      gen_utime: this.gen_utime,
      prev_key_block_seqno: this.prev_key_block_seqno,
      seq_no: this.seq_no,
      shard: this.shard,
      tr_count: this.tr_count,
      workchain_id: this.workchain_id,
      __typename: this.__typename,
    };
  }
}
