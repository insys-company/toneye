import { ValidatorSet } from '..';

export class BlockMasterConfig {
  p15: BlockMasterConfig15;
  p16: BlockMasterConfig16;
  p17: BlockMasterConfig17;
  p32: ValidatorSet; // prev
  p34: ValidatorSet; // current
  p36: ValidatorSet; //next
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
      __typename: this.__typename,
    };
  }
}

export class BlockMasterConfig15 {
  validators_elected_for: number;
	elections_start_before: number;
	elections_end_before: number;
	stake_held_for: number;
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
      validators_elected_for: this.validators_elected_for,
      elections_start_before: this.elections_start_before,
      elections_end_before: this.elections_end_before,
      stake_held_for: this.stake_held_for,
      __typename: this.__typename,
    };
  }
}

export class BlockMasterConfig16 {
  max_main_validators: number;
	max_validators: number;
	min_validators: number;
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
      max_main_validators: this.max_main_validators,
      max_validators: this.max_validators,
      min_validators: this.min_validators,
      __typename: this.__typename,
    };
  }
}

export class BlockMasterConfig17 {
  min_stake: string;
  max_stake: string;
  min_total_stake: string;
  max_stake_factor: number;
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
      min_stake: this.min_stake,
      max_stake: this.max_stake,
      min_total_stake: this.min_total_stake,
      max_stake_factor: this.max_stake_factor,
      __typename: this.__typename,
    };
  }
}
