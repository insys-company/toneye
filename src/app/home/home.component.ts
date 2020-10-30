import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { HomeService } from './home.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MessageQueries, TransactionQueries, BlockQueries, CommonQueries } from 'src/app/api/queries';
import { Message, ViewerData, Transaction, Block, SimpleDataFilter } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';
import { Subject } from 'rxjs';
import { LocaleText } from 'src/locale/locale';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent extends BaseComponent<any> implements OnInit, OnDestroy {

  /** Общие тексты для страниц */
  public locale = {
    homeTitle: LocaleText.homeTitle,
    homeInfoTitle: LocaleText.homeInfoTitle,
    date: LocaleText.timeFilterPlaceholder,
    tons: LocaleText.tonCountFilterPlaceholder,
    homeInfoText1: LocaleText.homeInfoText1,
    homeInfoText2: LocaleText.homeInfoText2,
    homeInfoText3: LocaleText.homeInfoText3,
    homeInfoText4: LocaleText.homeInfoText4,
    autoupdate: LocaleText.autoupdate,
  };
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(6);

  /**
   * For tabs header (titles)
   */
  public tabsTitles: Array<string> = [
    `${appRouteMap.blocks}`,
    `${appRouteMap.transactions}`,
    `${appRouteMap.messages}`
  ];

  /** Array of ... */
  public blocks: Block[] = [];
  public messages: Message[] = [];
  public transactions: Transaction[] = [];

  /**
   * Min time for aggregate data
   */
  protected utime_since: number;

  /**
   * Key for prev block for master block's config
   */
  protected prev_key_block_seqno: number;

  /**
   * Count of shards
   */
  protected shards_length: number = 0;
  /**
   * count of
   */
  protected aggregate_transactions: string;

  /**
   * count of
   */
  protected aggregate_account_count: string;

  /**
   * count of
   */
  protected aggregate_total_balance: string;

  /**
   * Single request for messages by params
   */
  public get isSingleQuery(): boolean {
    return !this.params || (this.params.chain == null && this.params.ext_int != 'ext') ? true : false
  }

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected homeService: HomeService,
    protected route: ActivatedRoute,
    protected router: Router,
    private messageQueries: MessageQueries,
    private transactionQueries: TransactionQueries,
    private blockQueries: BlockQueries,
    private commonQueries: CommonQueries,
  ) {
    super(
      changeDetection,
      homeService,
      route,
      router,
    );

     /** Loading animation in children */
    this.isGeneralInfoOpen = false;
    this.isAditionalInfoOpen = true;
  }

  /**
   * Initialization of the component
   * For details component
   */
  public initDatails(): void {
    this.route.params
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((params: Params) => {
        this.modelId = params['id'] != null ? params['id'].trim() : null;

        // Get aditional data
        this.initList();

      })
      .unsubscribe();
  }

  /**
   * Initialization of the component
   * For list component
   */
  public initList(): void {
    this.route.queryParams
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((queryParams: Params) => {

        this.params = _.clone(this._service.baseFunctionsService.getFilterParams(queryParams, this.params));

        this.detectChanges();

        if (this.initComplete) {
          this.refreshData();
        }

      });

    this.initMethod();
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.locale = null;
    this.tabsTitles = null;
    this.blocks = null;
    this.transactions = null;
    this.messages = null;
    this.utime_since = null;
    this.prev_key_block_seqno = null;
    this.shards_length = null;
    this.aggregate_transactions = null;
    this.aggregate_account_count = null;
    this.aggregate_total_balance = null;
  }


  /**
   * Export event
   */
  public onExport(): void {
    // TODO
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {

    // Scroll to top
    window.scrollTo({top: 0, behavior: 'smooth'});

    this.router.navigate([`${index == 0 ? appRouteMap.blocks : index == 1 ? appRouteMap.transactions : appRouteMap.messages}`]);
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  public onSelectTab(index: number): void {

    this.tableViewersLoading = true;
    this.tableViewerData = [];
    this.detectChanges();

    this.tableViewerData = index == 0
      ? this._service.mapDataForTable(this.blocks, appRouteMap.blocks)
      : index == 1
        ? this._service.mapDataForTable(this.transactions, appRouteMap.transactions)
        : this._service.mapDataForTable(this.messages, appRouteMap.messages);

    this.tableViewersLoading = false;
    this.detectChanges();

  }

  /**
   * For subscribers after ngOnDestroy
   */
  protected init(): void {
    this._service.init();
    this._unsubscribe = new Subject<void>();
    this.params = new SimpleDataFilter();

    /** Loading animation in children */
    this.isGeneralInfoOpen = false;
    this.isAditionalInfoOpen = true;
    this.viewersLoading = true;
    this.tableViewersLoading = true;

    this.detectChanges();
  }

  /**
   * First intit
   */
  protected initMethod(): void {
    this.getAggregateData();
  }

  /**
   * Получение данных
   */
  protected refreshData(): void {
    this.getData();
  }

  protected getData(): void {

    this.tableViewersLoading = true;
    this.detectChanges();

    // Get Blocks
    this._service.getData(
      this.homeService.getVariablesForBlocks(this.params),
      this.blockQueries.getBlocks,
      appRouteMap.blocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Block[]) => {

        this.blocks = res ? res : [];

        this.processData();

        this.tableViewerData = this._service.mapDataForTable(this.blocks, appRouteMap.blocks);
        this.tableViewersLoading = false;
        this.filterLoading = false;
        this.initComplete = true;
        this.detectChanges();

    }, (error: any) => {
      console.log(error);
    });

    // Одиночный вызов сообщений
    if (this.isSingleQuery) {
      // Get Messages
      this._service.getData(
        this.homeService.getVariablesForMessages(this.params),
        this.messageQueries.getMessages,
        appRouteMap.messages
      )
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((res: Message[]) => {

          this.messages = res ? res : [];
          this.tableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages);
          this.tableViewersLoading = false;
          this.filterLoading = false;
          this.initComplete = true;
          this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
    }

    // Запросы на сообщения по источникам и получателям
    else {
      // Get Messages
      this._service.getData(
        this.homeService.getVariablesForMessages(this.params, true),
        this.messageQueries.getMessages,
        appRouteMap.messages
      )
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((srcData: Message[]) => {

          srcData = srcData ? srcData : [];

          // Get Messages
          this._service.getData(
            this.homeService.getVariablesForMessages(this.params, false),
            this.messageQueries.getMessages,
            appRouteMap.messages
          )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((dstData: Message[]) => {

              dstData = dstData ? dstData : [];

              // Объединение двух массивов и сортировка
              let _data = srcData.concat(dstData);

              _data = (_.sortBy(_data, 'created_at')).reverse();

              this.messages = _data ? _data : [];
              this.tableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages);
              this.tableViewersLoading = false;
              this.filterLoading = false;
              this.initComplete = true;
              this.detectChanges();

          }, (error: any) => {
            console.log(error);
          });

      }, (error: any) => {
        console.log(error);
      });
    }


    // Get transactions
    this._service.getData(
      this.homeService.getVariablesForTransactions(this.params),
      this.transactionQueries.getTransactions,
      appRouteMap.transactions
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Transaction[]) => {

        this.transactions = res ? res : [];
        this.tableViewerData = this._service.mapDataForTable(this.transactions, appRouteMap.transactions);
        this.tableViewersLoading = false;
        this.filterLoading = false;
        this.initComplete = true;
        this.detectChanges();

    }, (error: any) => {
      console.log(error);
    });
  }

  /**
   * Get aggregate messages count
   */
  private getAggregateData(): void {
    this._service.getAggregateData(
      this.homeService.getVariablesForAggregateData(),
      this.commonQueries.getGeneralData
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: any) => {

        this.aggregate_transactions = res && res.aggregateTransactions[0] ? res.aggregateTransactions[0] : 0;
        this.aggregate_account_count = res && res.getAccountsCount[0] ? res.getAccountsCount[0] : 0;
        this.aggregate_total_balance = res && res.getAccountsTotalBalance[0] ? res.getAccountsTotalBalance[0] : 0;

        this.getPrevBlockKey();

    }, (error: any) => {
      console.log(error);
    });
  }

  /**
   * Get key of previos block
   */
  private getPrevBlockKey(): void {
    // Get master block
    this._service.getGeneralData(
      this._service.getVariablesForPrevBlockKey(),
      this.blockQueries.getMasterBlockPrevKey,
      appRouteMap.blocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((prevBlock: Block[]) => {

        prevBlock = prevBlock ? prevBlock : [];

        this.prev_key_block_seqno = prevBlock[0] ? prevBlock[0].prev_key_block_seqno : null;

        this.getPrevBlockConfig();

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get config of previos block
   */
  private getPrevBlockConfig(): void {
    // Get master block config
    this._service.getGeneralData(
      this._service.getVariablesForPrevBlockConfig(this.prev_key_block_seqno),
      this.blockQueries.getMasterBlockShard,
      appRouteMap.blocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((masterBlockConfig: Block[]) => {

        masterBlockConfig = masterBlockConfig ? masterBlockConfig : [];

        // For aggregate data
        this.utime_since = masterBlockConfig[0] && masterBlockConfig[0].master && masterBlockConfig[0].master.config && masterBlockConfig[0].master.config.p34
          ? masterBlockConfig[0].master.config.p34.utime_since
          : null;

        // count of shards
        this.shards_length = masterBlockConfig[0] && masterBlockConfig[0].master && masterBlockConfig[0].master && masterBlockConfig[0].master.shard_hashes
          ? masterBlockConfig[0].master.shard_hashes.length
          : 0;

        this.getData();

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get general data
   */
  private processData(): void {

    const aggregateTransactions = new ViewerData({
      title: LocaleText.totalTransactionCount,
      value: this.aggregate_transactions,
      isNumber: true
    });

    const getAccountsCount = new ViewerData({
      title: LocaleText.accounts,
      value: this.aggregate_account_count,
      isNumber: true
    });

    const getAccountsTotalBalance = new ViewerData({
      title: LocaleText.coins,
      value: this.aggregate_total_balance,
      isNumber: true
    });

    const shards = new ViewerData({
      title: LocaleText.workchainShards,
      value: this.shards_length,
      isNumber: true,
    });

    const headBlocks = new ViewerData({
      title: LocaleText.headBlocks,
      value: this.blocks.length ? _.max(this.blocks, function(b){ return b.seq_no; })['seq_no'] : 0,
      isNumber: true,
    });

    const averageBlockTime = new ViewerData({
      title: LocaleText.averageBlockTime,
      value: (this._service.baseFunctionsService.getAverageTime(this.blocks, 'gen_utime') + ' sec').replace('.', ','),
      isNumber: false,
    });

    this.generalViewerData = [];

    this.generalViewerData.push(headBlocks);
    this.generalViewerData.push(averageBlockTime);
    this.generalViewerData.push(shards);
    this.generalViewerData.push(aggregateTransactions);
    this.generalViewerData.push(getAccountsCount);
    this.generalViewerData.push(getAccountsTotalBalance);

    this.viewersLoading = false;

    this.detectChanges();
  }
}
