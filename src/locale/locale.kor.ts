import { ListItem, MenuItem } from 'src/app/api';
import { appRouteMap } from 'src/app/app-route-map';

export class LocaleText {

  static chainFilter: ListItem[] = [
    { id: '-1', name: 'Masterchain' },
    { id: '0', name: 'Workchain' }
  ];

  static extintFilter: ListItem[] = [
    { id: 'ext', name: '외부' },
    { id: 'int', name: '내부' }
  ];

  static diractionFilter: ListItem[] = [
    { id: 'src', name: 'Src' },
    { id: 'dst', name: 'Dst' }
  ];

  static abortFilter: ListItem[] = [
    { id: 'true', name: '실패만' },
    { id: 'false', name: '실패제외' }
  ];

  /** Menu */
  static menu: MenuItem[] = [
    {
      name: appRouteMap.blocks,
      routerLink: `/${appRouteMap.blocks}`,
      title: '블록',
    },
    {
      name: appRouteMap.transactions,
      routerLink: `/${appRouteMap.transactions}`,
      title: '트랜잭션',
    },
    {
      name: appRouteMap.messages,
      routerLink: `/${appRouteMap.messages}`,
      title: '메시지',
    },
    {
      name: appRouteMap.accounts,
      routerLink: `/${appRouteMap.accounts}`,
      title: '어카운트',
    },
    {
      name: appRouteMap.contracts,
      routerLink: `/${appRouteMap.contracts}`,
      title: '컨트랙트',
    },
    {
      name: appRouteMap.validators,
      routerLink: `/${appRouteMap.validators}`,
      title: '밸리데이터',
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
  static enough = '충분';
  static create = 'Create';
  static clearAll = 'Clear all';
  static import = 'Import';
  static export = '내보내기';
  static exportTo = 'CSV로 내보내기';
  static cancel = '취소';
  static back = 'Back';
  static copy = 'Copy';
  static yes = 'Yes';
  static no = 'No';
  static show = '표기';
  static hide = '숨기기';
  static more = '더 보기';
  static less = '덜 보기';
  static recent = '최근';
  static autoupdate = '자동 업데이트';
  static last = 'Last';
  static previous = '이전';
  static current = '현재';
  static next = '다음';
  static from = '부터';
  static to = '까지';
  static download = 'Download';
  static ok = '확인';
  static exported = 'Exported';
  static rows = 'rows';
  static search = '검색';
  static selectAll = 'Select All';
  static notFound = '찾을 수 없음';
  static min = 'Min';
  static max = 'Max';
  static label = 'Label';
  static placeholder = 'Placeholder';
  static items = 'items';
  static new = 'new';
  static sec = '둘째';

  static loadMore = '25개 더 보기';

  static general = '일반';
  static filters = '필터';
  static calculationFilters = 'Calculation filters';

  static details = 'Details';
  static list = '리스트';

  static moreDetails = '세부 내용';
  static seeAll = 'See all';
  static seeAllBlocks = '모든 블록 보기';
  static seeAllTransactions = '모든 트랜잭션 보기';
  static seeAllMessages = '모든 메시지 보기';
  static set = 'set';

  // Filters
  static chainsFilterPlaceholder = '모든 체인';

  // Datepicker
  static timeFilterPlaceholder = '모든 기간';
  static periodFilterPlaceholder = '활성화 기간';

  static shardsFilterPlaceholder = '모든 샤드';
  static extIntFilterPlaceholder = '외부+내부';
  static abortFilterPlaceholder = '실패 여부';
  static transactionDateFilterPlaceholder = '트랜잭션 날짜';
  static directionFilterPlaceholder = 'Any direction';
  static transactionCountFilterPlaceholder = '트랜잭션 개수';
  static tonCountFilterPlaceholder = '톤 개수';

  // Pages
  static homePage = '홈';

  static accountsPage = '어카운트';
  static accountPage = '어카운트 자세 내용';

  static blocksPage = '블록';
  static blockPage = '블록 정보';

  static messagesPage = '메시지';
  static messagePage = '메시지 자세 사항';

  static transactionsPage = '트랜잭션';
  static transactionPage = '트랜잭션 세부 내용';

  static contractsPage = '컨트랙트';
  static contractPage = '컨트랙트 내용';

  static validatorsPage = '밸리데이터';
  static validatorPage = '밸리데이터 세부 내용';

  // Home text
  static homeTitle = '네트워크 상태';
  static homeInfoTitle = 'TON Labs Dev Network';
  static homeInfoText1 = 'TON Labs Developer Network runs the latest stable version of TON Blockchain.';
  static homeInfoText2 = 'The goal of TON Labs Dev Net is to provide stable development environment for application developers. It is optimized to connect with TON Labs’ SDK. Read more here:';
  static homeInfoText3 = 'You can receive  currency using our giver or by installing one of our wallets.';
  static homeInfoText4 = 'If you are interested in running a validator Node, please contact us at ';
  static lastBlocks = '마지막 블록';
  static lastTransactions = '마지막 트랜잭션';
  static lastMessages = '마지막 메시지';

  // Block text
  static blockMiddleTableTitle = '수신 메시지';
  static blockLastTableTitle = '발신 메시지';

  // Contract text
  static counsTop = '탑 코인';
  
  // Validator text
  static valodatorTableTitle = '서명한 마스터체인 ';

  static searchPlaceholder = '블록, 트랜잭션, 메시지, 계정, 밸리데이터의 아이디로 검색하세요';
  static searchMessage = '관련 메시지';
  static searchTransaction = '트랜잭션 포함';
  static searchBlock = '블록 사인한';

  // EXPORT
  static exportPlaceholder = '내보낼 줄 갯수';
  static exportError = '모든 데이터를 내보낼수 없습니다';
  static exportErrorText = '내보내기 기능에 오류가 있습니다. 나중에 다시 시도해 주세요. 내보낸 데이터는 저장했습니다.';

  // GENERAL DATA TITLES

  // Home general
  static headBlocks = '헤드블록';
  static averageBlockTime = '평균 블록 시간';
  static totalTransactionCount = '총 트랜잭션 개수';
  static workchainShards = '워크체인 샤드';
  static accounts = '어카운트';
  static blocks = '블록';
  static transactions = '트랜잭션';
  static messages = '메시지';
  static validators = '밸리데이터';
  static coins = '코인';

  // Blocks general
  static blocksByCurrentValidators = '현재 밸리데이터가 처리한 블록';

  // Block details groups
  static valueFlowGroup = '가치 플로우';
  static accountBlocksGroup = '어카운트 블록';
  static shardsGroup = '샤드';
  static masterConfigGroup = '마스터 환결설정';

  // Block details fields
  static id = '아이디';
  static timeDate = '시간 & 날짜';
  static number = '번호';
  static workchain = '워크체인';
  static shard = '샤드';
  static prevKeyBlockSeqNo = '이전 키 블록 시퀸스 번호';

  static logicalTime = '로지컬 시간';
  static feesCollected = '수집한 수수료';
  static parent = '부모';
  static globalId = '글로벌 아이디';
  static wantSplit = '분할 요청 여부';
  static afterMerge = '병합 여부';
  static getCatchainSeqNo = '캣체인 시퀸스 번호 받기 ';
  static prevRefRootHash = '이전 루트 해시 레퍼런스';
  static version = '버전';
  static genValidatorListHashShort = '밸리데이터 리스트 단축 해시';
  static beforeSplit = '분할 전';
  static afterSplit = '분할 후';
  static wantMerge = '병합 요청 여부';
  static vertSeqNo = '수직 시퀸스 번호';
  static minReqMcSeqNo = '최소 레퍼런스 마스터체인 시퀸스 번호';
  static genSoftwareVersion = '소프트웨어 버전';
  static genSoftwareCapabilities = '소프트웨어 기능';
  static randSeed = '랜드 시드';
  static boc = 'Boc';
  // Подзаголовок
  static recoverCreateMsg = '회수 메시지 생성';
  static msgType = '메시지 종류';
  static ihrFee = 'Ihr 수수료';
  static inMsgMsgId = '수신 메시지 / 메시지 아이디';
  static inMsgNextAddr = '수신 메시지 / 다음 주소';
  static inMsgCurrAddr = '수신 메시지 / 현 주소';
  static inMsgFwdFeeRemaining = '수신 메시지 / 남은 전달 수수료';
  static fwdFee = '전달 수수료';
  static transitFee = '프랜짓 수수료';
  static transactionId = '트랜잭션 아이디';

  static toNextBlock = '다음 블록으로';
  static created = '생성됨';
  static imported = '불러옴';
  static fromPrevBlock = '이전 블록에서';
  static minted = '생성됨';
  static feesImported = '불러온 수수료';
  // Подзаголовок
  static accountBlocks = '어카운트 블록 번호';

  static accountAddr = '어카운트 주소';
  static oldHash = '올드 해시';
  static newHash = '뉴 해시';
  static trCount = '트랜잭션 수';

  static minShardGenUtime = '최소 샤드 시간';
  static maxShardGenUtime = '최대 샤드 시간';
  // Подзаголовок
  static shardHash = '샤드 해시 번호';
  static workchainShard = '워크체인:샤드';

  static seqNo = '시퀸스 번호';
  static regMcSeqno = '일반 마스터체인 시퀸스 번호';
  static startLtEndLt = '시작 로지컬 시간 - 마지막 로지컬 시간';
  static rootHash = '루트 해시';
  static fileHash = '파일 해시';
  static beforeMerge = '병합 전';
  static nxCcUpdated = '업데이트됨';
  static flags = '플래그';
  static nextCatchainSeqno = '다음 캣체인 시퀸스 번호';
  static nextValidatorShard = '다음 밸리데이터 샤드';
  static minRefMcSeqno = '최소 마스터체인 레퍼런스 시퀸스 번호';
  static genUtime = '생성 시간';
  static fundsCreated = '생성된 자금';

  // Подзаголовок
  static shardFee = 'Shard fee №';
  static fees = 'Fees';

  // Master config нет

  // Transactions general
  static transactionCount = '트랜잭션 개수';
  static tps = '초당 트랜잭션 개수';

  // Transactions details groups
  static type = '종류';
  static account = '어카운트';

  static block = '블록';
  static blockID = '블록 아이디';
  static prevTransactionHash = '이전 트랜잭션 해시';
  static prevTransactionLt = '이전 트랜잭션 아이디';
  static outMessagesCount = '발신 메시지 수';
  static originalStatus = '기존 상태';
  static endStatus = '현재 상태';
  static aborted = '실패';

  // Подзаголовок
  static storage = '스토리지';
  static storageFeesCollected = '수집된 스토리지 수수료 ';
  static storageFeesDue = '스토리지 수수료 납기금';
  static statusChange = '상태 변화';
  // Подзаголовок
  static compute = '연산';
  static gaasLimit = '가스 제한';
  static gaasUsed = '사용된 가스';
  static gaasFees = '가스 수수료';
  static gasCredit = '가스 크레딧';
  static computeType = '연산 종류';
  static success = '성공';
  static messageStateUsed = '사용된 메시지 상태';
  static accountActivated = '계정 활성화 ';
  static mode = '모드';
  static exitCode = 'Exit 코드';
  static vMSteps = '가상머신 스텝';
  static vMInitStateHash = '가상머신 활성화 상태 해시';
  static vMFinalStateHash = '가상머시 최종 상태 해시';
  // Подзаголовок
  static action = '액션';
  static valid = '유효';
  static noFunds = '자금 없음';
  static totalFwdFees = '총 전달 수수료';
  static totalActionFees = '총 액션 수수료';
  static resultCode = '결과 코드';
  static totActions = 'Tot 액션';
  static specActions = '스펙 액션';
  static skippedActions = '건너뛴 액션';
  static messagesCreated = '생성된 메시지';
  static actionListHash = '액션 리스트 해시';
  // Подзаголовок
  static finalState = 'Final state';
  static destroyed = '파기됨';
  static ext = 'ext';
  static tick = 'Tick';
  static tock = 'Tock';

  // Messages general
  static messageCount = '메시지 수';
  static mps = '초당 메시지 개수';
  // Messages details fields
  static value = '가치';
  static childTransaction = '차일드 트랜잭션';
  static iHRFee = 'IHR 수수료';
  static bounce = '튕기기 ';
  static bounced = '튕귐';

  // Accounts general
  // Accounts details fields
  static addressHex = '주소';
  static status = '상태';
  static balance = '잔고';

  static duePayment = '납기금';
  static lastTransactionLt = '마지막 트랜잭션 로지컬 시간';
  static code = '코드';
  static codeHash = '코드 해시';
  static data = '데이터';
  static dataHash = '데이터 해시';
  static lastPaid = '마지막 거래';

  // Contracts general
  static uniqueContracts = '고유 컨트랙트';

  // Contracts details fields
  static surf = 'Surf';
  static contracts = '컨트랙트';
  static deployed = '배포 여부';
  static activeInPeriod = '활성화 기간';
  static newInPeriod = '새로운 기간';
  static totalBalances = '총 잔고';
  static lastTx = '마지막 트랜잭션';

  // Validators general
  static activePeriod = '액티브 기간';
  static since = '부터';
  static until = '까지';

  // Validators details blocks
  static validatorConfig = '밸리데이터 설정';
  static electionParameters = 'p15 (선거 파라미터)';
  static validatorsCount = 'p16 (밸리데이터 수)';
  static validatorStake = 'p17 (밸리데이터 스테이크 파라미터)';

  // Validators details fields
  static numberOfCurrentValidators = '현재 밸리데이터 수';
  static electionsStatus = '선거 현황';
  static electionsStart = '선거 시작';
  static nextElectionsStart = '다음 선거 시작';
  static electionsEnd = '선거 마감';
  static nextElectionsEnd = '다음 선거 마감';

  static validatorsElectedFor = '밸리데이터 선출 기간';
  static electionsStartBefore = '전에 선거 시작';
  static electionsEndBefore = '전에 선거 마감';
  static stakeHeldFor = '스테이킹 홀드 시간';
  static maxMainValidators = '최대 메인 밸리데이터';
  static maxValidators = '최대 벨리데이터';
  static minValidators = '최소 밸리데이터';
  static maxStake = '최대 스테이크';
  static maxStakeFactor = '최대 스테이크 팩터';
  static minStake = '최소 스테이크';
  static minTotalStake = '최소 총 스테이크';

  static adnl = 'adnl';

  static publicKeyHex = '퍼블릭키 헥스';
  static publicKeyBase64 = '퍼블릭키 베이스64';
  static adnlAddressHex = 'ADNL 주소 헥스';
  static adnlAddressBase64 = 'ADNL 주소 베이스64';
  static nodeIDHex = '노드 아이디 헥스';
  static stake = '스테이크';
  static weight = '중량';
  static utimeSince = '부터';
  static utimeUntil = '까지';
  static signedMasterchainBlocks = '서명한 마스터체인';
  static totalNumberOfMasterchainBlocks = '마스터체인 블록 전체 수';
  static uptime = '업타임';
}