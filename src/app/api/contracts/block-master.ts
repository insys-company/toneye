import { BlockMasterShardFees, BlockMasterShardHashes, MsgData, BlockMasterConfig } from '..';

export class BlockMaster {
  config: BlockMasterConfig
  config_addr: string;
  max_shard_gen_utime: number;
  min_shard_gen_utime: number;
  recover_create_msg: MsgData;
  shard_fees: Array<BlockMasterShardFees>
  shard_hashes: Array<BlockMasterShardHashes>;
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
      config: this.config,
      config_addr: this.config_addr,
      max_shard_gen_utime: this.max_shard_gen_utime,
      min_shard_gen_utime: this.min_shard_gen_utime,
      shard_hashes: this.shard_hashes,
      __typename: this.__typename,
    };
  }
}
