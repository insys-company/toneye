import { ListItem, MenuItem } from 'src/app/api';
import { appRouteMap } from 'src/app/app-route-map';

export class LocaleText {

  static chainFilter: ListItem[] = [
    { id: '-1', name: 'Masterchain' },
    { id: '0', name: 'Workchain' }
  ];

  static extintFilter: ListItem[] = [
    { id: 'ext', name: 'Ext' },
    { id: 'int', name: 'Int' }
  ];

  static diractionFilter: ListItem[] = [
    { id: 'srt', name: 'Src' },
    { id: 'dst', name: 'Dst' }
  ];

  static abortFilter: ListItem[] = [
    { id: 'true', name: 'Aborted' },
    { id: 'false', name: 'Not Aborted' }
  ];

  /** Menu */
  static menu: MenuItem[] = [
    {
      name: appRouteMap.blocks,
      routerLink: `/${appRouteMap.blocks}`,
      title: appRouteMap.blocks,
    },
    {
      name: appRouteMap.transactions,
      routerLink: `/${appRouteMap.transactions}`,
      title: appRouteMap.transactions,
    },
    {
      name: appRouteMap.messages,
      routerLink: `/${appRouteMap.messages}`,
      title: appRouteMap.messages,
    },
    {
      name: appRouteMap.accounts,
      routerLink: `/${appRouteMap.accounts}`,
      title: appRouteMap.accounts,
    },
    {
      name: appRouteMap.contracts,
      routerLink: `/${appRouteMap.contracts}`,
      title: appRouteMap.contracts,
    },
    {
      name: appRouteMap.validators,
      routerLink: `/${appRouteMap.validators}`,
      title: appRouteMap.validators,
    },
  ];

  /** Actions */
  static remove = 'Remove';
  static delete = 'Delete';
  static edit = 'Edit';
  static add = 'Add';
  static save = 'Save';
  static update = 'Update';
  static rename = 'Rename';
  static done = 'Done';
  static enough = 'Enough';
  static create = 'Create';
  static clearAll = 'Clear all';
  static import = 'Import';
  static export = 'Export';
  static exportTo = 'Export to csv';
  static cancel = 'Cancel';
  static back = 'Back';
  static copy = 'Copy';
  static yes = 'Yes';
  static no = 'No';
  static show = 'Show';
  static hide = 'Hide';
  static more = 'More info';
  static less = 'Less info';
  static recent = 'Recent';
  static autoupdate = 'Autoupdate';
  static last = 'Last';
  static previous = 'Previous';
  static current = 'Current';
  static next = 'Next';
  static from = 'From';
  static to = 'To';
  static download = 'Download';
  static ok = 'Okay';
  static exported = 'Exported';
  static rows = 'rows';
  static search = 'Search';
  static selectAll = 'Select All';
  static notFound = 'Not Found';
  static min = 'Min';
  static max = 'Max';
  static label = 'Label';
  static placeholder = 'Placeholder';
  static items = 'items';
  static new = 'new';

  static loadMore = 'Load 25 more';

  static general = 'General';
  static filters = 'Filters';
  static calculationFilters = 'Calculation filters';

  static details = 'Details';
  static list = 'List';

  static moreDetails = 'More details';
  static seeAll = 'See all';
  static set = 'set';

  // Filters
  static chainsFilterPlaceholder = 'All chains';

  // Datepicker
  static timeFilterPlaceholder = 'All time';
  static periodFilterPlaceholder = 'Any active period';

  static shardsFilterPlaceholder = 'All shards';
  static extIntFilterPlaceholder = 'Ext+Int';
  static abortFilterPlaceholder = 'Aborted and not';
  static transactionDateFilterPlaceholder = 'Any l.transaction date';
  static directionFilterPlaceholder = 'Any direction';
  static transactionCountFilterPlaceholder = 'Any transaction count';
  static tonCountFilterPlaceholder = 'With any tons number';

  // Pages
  static homePage = 'home';

  static accountsPage = 'accounts';
  static accountPage = 'account details';

  static blocksPage = 'blocks';
  static blockPage = 'block details';

  static messagesPage = 'messages';
  static messagePage = 'message details';

  static transactionsPage = 'transactions';
  static transactionPage = 'transaction details';

  static contractsPage = 'contracts';
  static contractPage = 'contract details';

  static validatorsPage = 'validators';
  static validatorPage = 'validator details';

  // Home text
  static homeTitle = 'Network Status';
  static homeInfoTitle = 'TON Labs Dev Network';
  static homeInfoText1 = 'TON Labs Developer Network runs the latest stable version of TON Blockchain.';
  static homeInfoText2 = 'The goal of TON Labs Dev Net is to provide stable development environment for application developers. It is optimized to connect with TON Labs’ SDK. Read more here:';
  static homeInfoText3 = 'You can receive  currency using our giver or by installing one of our wallets.';
  static homeInfoText4 = 'If you are interested in running a validator Node, please contact us at ';

  // Block text
  static blockMiddleTableTitle = 'In messages';
  static blockLastTableTitle = 'Out messages';

  // Contract text
  static counsTop = 'Top by coins';
  
  // Validator text
  static valodatorTableTitle = 'Signed masterchain blocks ';

  static searchPlaceholder = 'Type id of block, transaction, message, account or validator for search them';
  static searchMessage = 'that contain that message';
  static searchTransaction = 'that contain that transaction';
  static searchBlock = 'that signed that block';

  // EXPORT
  static exportPlaceholder = 'The number of rows to export';
  static exportError = 'Can’t export all items';
  static exportErrorText = 'We have problems with export, try later. We save exported items.';

  // GENERAL DATA TITLES

  // Home general
  static headBlocks = 'Head blocks';
  static averageBlockTime = 'Average block time';
  static totalTransactionCount = 'Total transaction count';
  static workchainShards = 'Workchain shards';
  static accounts = 'Accounts';
  static blocks = 'Blocks';
  static transactions = 'Transactions';
  static messages = 'Messages';
  static validators = 'Validators';
  static coins = 'Coins';

  // Blocks general
  static blocksByCurrentValidators = 'Blocks by current validators';

  // Block details groups
  static valueFlowGroup = 'Value flow';
  static accountBlocksGroup = 'Account blocks';
  static shardsGroup = 'Shards';
  static masterConfigGroup = 'Master config';

  // Block details fields
  static id = 'ID';
  static timeDate = 'Time & Date';
  static number = 'Number';
  static workchain = 'Workchain';
  static shard = 'Shard';
  static prevKeyBlockSeqNo = 'Prev key block seq no';

  static logicalTime = 'Logical time';
  static feesCollected = 'Fees collected';
  static parent = 'Parent';
  static globalId = 'Global Id';
  static wantSplit = 'Want split';
  static afterMerge = 'After merge';
  static getCatchainSeqNo = 'Get catchain seq no';
  static prevRefRootHash = 'Prev ref root hash';
  static version = 'Version';
  static genValidatorListHashShort = 'Gen validator list hash short';
  static beforeSplit = 'Before split';
  static afterSplit = 'After split';
  static wantMerge = 'Want merge';
  static vertSeqNo = 'Vert seq no';
  static minReqMcSeqNo = 'Min req mc seq no';
  static genSoftwareVersion = 'Gen software version';
  static genSoftwareCapabilities = 'Gen software capabilities';
  static randSeed = 'Rand seed';
  static boc = 'Boc';
  // Подзаголовок
  static recoverCreateMsg = 'Recover create msg';
  static msgType = 'Msg type';
  static ihrFee = 'Ihr fee';
  static inMsgMsgId = 'In msg / Msg Id';
  static inMsgNextAddr = 'In msg / Next addr';
  static inMsgCurrAddr = 'In msg / Curr addr';
  static inMsgFwdFeeRemaining = 'In msg / Fwd fee remaining';
  static fwdFee = 'Fwd fee';
  static transitFee = 'Transit fee';
  static transactionId = 'Transaction id';

  static toNextBlock = 'To next block';
  static created = 'Created';
  static imported = 'Imported';
  static fromPrevBlock = 'From prev block';
  static minted = 'Minted';
  static feesImported = 'Fees imported';
  // Подзаголовок
  static accountBlocks = 'Account blocks';

  static accountAddr = 'Account addr';
  static oldHash = 'Old hash';
  static newHash = 'New hash';
  static trCount = 'Tr count';

  static minShardGenUtime = 'Min shard gen utime';
  static maxShardGenUtime = 'Max shard gen utime';
  // Подзаголовок
  static shardHash = 'Shard hash';

  static seqNo = 'Seq no';
  static regMcSeqno = 'Reg mc seqno';
  static startLtEndLt = 'Start lt - End lt';
  static rootHash = 'Root hash';
  static fileHash = 'File hash';
  static beforeMerge = 'Before merge';
  static nxCcUpdated = 'Nx cc updated';
  static flags = 'Flags';
  static nextCatchainSeqno = 'Next catchain seqno';
  static nextValidatorShard = 'Next validator shard';
  static minRefMcSeqno = 'Min ref mc seqno';
  static genUtime = 'Gen utime';
  static fundsCreated = 'Funds created';

  // Подзаголовок
  static shardFee = 'Shard fee';
  static fees = 'Fees';

  // Master config нет

  // Transactions general
  static transactionCount = 'Transaction count';
  static tps = 'TPS';

  // Transactions details groups
  static type = 'Type';
  static account = 'Account';

  static block = 'Block';
  static blockID = 'Block ID';
  static prevTransactionHash = 'Prev. transaction hash';
  static prevTransactionLt = 'Prev. transaction lt';
  static outMessagesCount = 'Out messages count';
  static originalStatus = 'Original status';
  static endStatus = 'End status';
  static aborted = 'Aborted';

  // Подзаголовок
  static storage = 'Storage';
  static storageFeesCollected = 'Storage fees collected';
  static storageFeesDue = 'Storage fees due';
  static statusChange = 'Status change';
  // Подзаголовок
  static compute = 'Compute';
  static gaasLimit = 'Gas Limit';
  static gaasUsed = 'Gas Used';
  static gaasFees = 'Gas fees';
  static gasCredit = 'Gas credit';
  static computeType = 'Compute type';
  static success = 'Success';
  static messageStateUsed = 'Message state used';
  static accountActivated = 'Account activated';
  static mode = 'Mode';
  static exitCode = 'Exit code';
  static vMSteps = 'VM steps';
  static vMInitStateHash = 'VM init state hash';
  static vMFinalStateHash = 'VM final state hash';
  // Подзаголовок
  static action = 'Action';
  static valid = 'Valid';
  static noFunds = 'No funds';
  static totalFwdFees = 'Total fwd fees';
  static totalActionFees = 'Total action fees';
  static resultCode = 'Result code';
  static totActions = 'Tot actions';
  static specActions = 'Spec actions';
  static skippedActions = 'Skipped actions';
  static messagesCreated = 'Messages created';
  static actionListHash = 'Action list hash';
  // Подзаголовок
  static finalState = 'Final state';
  static destroyed = 'Destroyed';
  static ext = 'ext';
  static tick = 'Tick';
  static tock = 'Tock';

  // Messages general
  static messageCount = 'Message count';
  static mps = 'MPS';
  // Messages details fields
  static value = 'Value';
  static childTransaction = 'Child transaction';
  static iHRFee = 'IHR Fee';
  static bounce = 'Bounce';
  static bounced = 'Bounced';

  // Accounts general
  // Accounts details fields
  static addressHex = 'Address';
  static status = 'Status';
  static balance = 'Balance';

  static duePayment = 'Due payment';
  static lastTransactionLt = 'Last transaction lt';
  static code = 'Code';
  static codeHash = 'Code hash';
  static data = 'Data';
  static dataHash = 'Data hash';

  // Contracts general
  static uniqueContracts = 'Unique contracts';

  // Contracts details fields
  static surf = 'Surf';
  static contracts = 'Contracts';
  static deployed = 'Deployed';
  static activeInPeriod = 'Active in period';
  static newInPeriod = 'New in period';
  static totalBalances = 'Total balances';
  static lastTx = 'Last Tx';

  // Validators general
  static activePeriod = 'Active period';
  static since = 'Since';
  static until = 'Until';

  // Validators details blocks
  static validatorConfig = 'Validator configs';
  static electionParameters = 'p15 (Election parameters)';
  static validatorsCount = 'p16 (Validators count)';
  static validatorStake = 'p17 (Validator stake parameters)';

  // Validators details fields
  static numberOfCurrentValidators = 'Number of current validators';
  static electionsStatus = 'Elections status';
  static electionsStart = 'Elections start';
  static nextElectionsStart = 'Next elections start';
  static electionsEnd = 'Elections end';
  static nextElectionsEnd = 'Next elections end';

  static validatorsElectedFor = 'Validators elected for';
  static electionsStartBefore = 'Elections start before';
  static electionsEndBefore = 'Elections end before';
  static stakeHeldFor = 'Stake held for';
  static maxMainValidators = 'Max main validators';
  static maxValidators = 'Max validators';
  static minValidators = 'Min validators';
  static maxStake = 'Max stake';
  static maxStakeFactor = 'Max stake factor';
  static minStake = 'Min stake';
  static minTotalStake = 'Min total stake';

  static adnl = 'adnl';

  static publicKeyHex = 'Public key hex';
  static publicKeyBase64 = 'Public key base64';
  static adnlAddressHex = 'ADNL address hex';
  static adnlAddressBase64 = 'ADNL address base64';
  static nodeIDHe = 'Node ID he';
  static stake = 'Stake';
  static weight = 'Weight';
  static utimeSince = 'Utime since';
  static utimeUntil = 'Utime until';
  static signedMasterchainBlocks = 'Signed masterchain blocks';
  static totalNumberOfMasterchainBlocks = 'Total number of masterchain blocks';
  static uptime = 'Uptime';
}