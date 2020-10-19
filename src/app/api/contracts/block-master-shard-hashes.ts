import { BlockMasterShardHashesDescr } from '..';

export class BlockMasterShardHashes {
  shard: string;
  descr: BlockMasterShardHashesDescr;
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
      shard: this.shard,
      descr: this.descr,
      workchain_id: this.workchain_id,
      __typename: this.__typename,
    };
  }
}
