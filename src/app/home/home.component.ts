import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { HomeService } from './home.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MessageQueries, TransactionQueries, BlockQueries, CommonQueries } from 'src/app/api/queries';
import { Message, ViewerData, Transaction, Block, SimpleDataFilter, TabViewerData } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';
import { Subject, timer } from 'rxjs';
import { LocaleText } from 'src/locale/locale';
import { MatDialog } from '@angular/material/dialog';

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

  public newBlocks: Block[] = [];
  public newMessages: Message[] = [];
  public newTransactions: Transaction[] = [];

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
    protected dialog: MatDialog,
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
      dialog
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

    this.newBlocks = null;
    this.newMessages = null;
    this.newTransactions = null;
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
   * Show new data
   */
  public onShowNewData(): void {
    this.viewersLoading = true;
    this.tableViewersLoading = true;
    this.detectChanges();

    this.tableViewerData = this.tableViewerData ? this.tableViewerData : [];
    this.newDataAfterUpdateForView = this.newDataAfterUpdateForView ? this.newDataAfterUpdateForView : [];

    if (this.selectedTabIndex == 0) {

      this.blocks = this.blocks ? this.blocks : [];
      this.blocks = _.clone(this.newBlocks.concat(this.blocks));
      this.tableViewerData = this._service.mapDataForTable(this.blocks, appRouteMap.blocks, 10);
      this.newBlocks = [];
    }
    else if (this.selectedTabIndex == 1) {

      this.transactions = this.transactions ? this.transactions : [];
      this.transactions = _.clone(this.newTransactions.concat(this.transactions));
      this.tableViewerData = this._service.mapDataForTable(this.transactions, appRouteMap.transactions, 10);
      this.newTransactions = [];
    }
    else {

      this.messages = this.messages ? this.messages : [];
      this.messages= _.clone(this.newMessages.concat(this.messages));
      this.tableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages, 10);
      this.newMessages = [];
    }

    this.newDataAfterUpdateForView = [];

    this.viewersLoading = false;
    this.tableViewersLoading = false;
    this.detectChanges();

  }

  /**
   * Show new data
   */
  public onShowAllNewData(): void {

    this.viewersLoading = true;
    this.tableViewersLoading = true;
    this.detectChanges();

    this.tableViewerData = this.tableViewerData ? this.tableViewerData : [];
    this.newDataAfterUpdateForView = this.newDataAfterUpdateForView ? this.newDataAfterUpdateForView : [];

    this.blocks = this.blocks ? this.blocks : [];
    this.messages = this.messages ? this.messages : [];
    this.transactions = this.transactions ? this.transactions : [];

    this.blocks = _.clone(this.newBlocks.concat(this.blocks));
    this.transactions = _.clone(this.newTransactions.concat(this.transactions));
    this.messages= _.clone(this.newMessages.concat(this.messages));

    this.tableViewerData = this.selectedTabIndex == 0
      ? this._service.mapDataForTable(this.blocks, appRouteMap.blocks, 10)
      : this.selectedTabIndex == 1
        ? this._service.mapDataForTable(this.transactions, appRouteMap.transactions, 10)
        : this._service.mapDataForTable(this.messages, appRouteMap.messages, 10);
    
    
    this.newBlocks = [];
    this.newTransactions = [];
    this.newMessages = [];
    this.newDataAfterUpdateForView = [];

    this.viewersLoading = false;
    this.tableViewersLoading = false;
    this.detectChanges();

  }

  /**
   * Change autoupdate checkbox
   * @param check Flag
   */
  public updateChange(check: boolean) {
    this.autoupdate = check;

    this.updateUnsubscribe();

    if (!this.autoupdate) {
      this.onShowAllNewData();
    }
    else {
      this.subscribeOnUpdate();
    }

    this.detectChanges();
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  public onSelectTab(index: number): void {

    this.selectedTabIndex = index;

    this.tableViewersLoading = true;
    this.tableViewerData = [];
    this.detectChanges();

    this.tableViewerData = index == 0
      ? this._service.mapDataForTable(this.blocks, appRouteMap.blocks, 10)
      : index == 1
        ? this._service.mapDataForTable(this.transactions, appRouteMap.transactions, 10)
        : this._service.mapDataForTable(this.messages, appRouteMap.messages, 10);

    this.newDataAfterUpdateForView = index == 0
      ? this._service.mapDataForTable(this.newBlocks, appRouteMap.blocks)
      : index == 1
        ? this._service.mapDataForTable(this.newTransactions, appRouteMap.transactions)
        : this._service.mapDataForTable(this.newMessages, appRouteMap.messages);       

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
  protected subscribeData(): void {
    if (this.selectedTabIndex == 0) {
      this.getBlocks();
    }
    else if (this.selectedTabIndex == 1) {
      this.getTransactions();
    }
    else {
      this.getMessages();
    }
  }

  /**
   * Получение данных
   */
  protected refreshData(): void {
    this.getData();
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
   * Get data
   */
  protected getData(): void {

    if (!this.autoupdate) {
      this.tableViewersLoading = true;
      this.detectChanges();
    }

    this.getBlocks();

    this.getMessages();

    this.getTransactions();
  }

  /**
   *  For update
   */
  protected subscribeOnUpdate(): void {
    this._updateUnsubscribe = new Subject<void>();
    /**Отправляем на сервер каждын 2 секунда запрос  */
    const _timer = timer(Infinity, 2000);

    _timer
      .pipe(takeUntil(this._updateUnsubscribe))
      .subscribe(() => {

        // this.refreshData();
        this.subscribeData();

      }, error => {
        this.updateUnsubscribe();
      });
  }

  /**
   * Get message list
   */
  private getMessages(): void {
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

          res = res ? res : [];

          if (!this.autoupdate) {
            this.messages = res;
            if (this.selectedTabIndex == 2) {
              this.tableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages, 10);
            }
            this.tableViewersLoading = false;
            this.filterLoading = false;
            this.initComplete = true;
            this.detectChanges();
          }
          else {
            this.newMessages = this.newMessages ? this.newMessages : [];
  
            let uniqItems = [];
  
            res.forEach((item: Message) => {
              let filterItem = _.findWhere(this.messages, {id: item.id});
              let filterNewItem = _.findWhere(this.newMessages, {id: item.id});
              if (!filterItem && !filterNewItem) { uniqItems.push(item); }
            });
  
            if (uniqItems.length) {
              this.newMessages = _.clone(uniqItems.concat(this.newMessages));
              if (this.selectedTabIndex == 2) {
                this.newDataAfterUpdateForView = this._service.mapDataForTable(this.newMessages, appRouteMap.messages);
              }
            }
  
            this.detectChanges();
          }

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
              let res = srcData.concat(dstData);

              res = (_.sortBy(res, 'created_at')).reverse();

              if (!this.autoupdate) {
                this.messages = res;
                if (this.selectedTabIndex == 2) {
                  this.tableViewerData = this._service.mapDataForTable(this.messages, appRouteMap.messages, 10);
                }
                this.tableViewersLoading = false;
                this.filterLoading = false;
                this.initComplete = true;
                this.detectChanges();
              }
              else {
                this.newMessages = this.newMessages ? this.newMessages : [];
      
                let uniqItems = [];
      
                res.forEach((item: Message) => {
                  let filterItem = _.findWhere(this.messages, {id: item.id});
                  let filterNewItem = _.findWhere(this.newMessages, {id: item.id});
                  if (!filterItem && !filterNewItem) { uniqItems.push(item); }
                });
      
                if (uniqItems.length) {
                  this.newMessages = _.clone(uniqItems.concat(this.newMessages));
                  if (this.selectedTabIndex == 2) {
                    this.newDataAfterUpdateForView = this._service.mapDataForTable(this.newMessages, appRouteMap.messages);
                  }
                }
      
                this.detectChanges();
              }

          }, (error: any) => {
            console.log(error);
          });

      }, (error: any) => {
        console.log(error);
      });
    }
  }

  /**
   * Get block list
   */
  private getBlocks(): void {
    // Get Blocks
    this._service.getData(
      this.homeService.getVariablesForBlocks(this.params),
      this.blockQueries.getBlocks,
      appRouteMap.blocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Block[]) => {

        res = res ? res : [];

        if (!this.autoupdate) {
          this.blocks = res;
          this.processData();
          if (this.selectedTabIndex == 0) {
            this.tableViewerData = this._service.mapDataForTable(this.blocks, appRouteMap.blocks, 10);
          }
          this.tableViewersLoading = false;
          this.filterLoading = false;
          this.initComplete = true;
          this.detectChanges();
        }
        else {
          this.newBlocks = this.newBlocks ? this.newBlocks : [];

          let uniqItems = [];

          res.forEach((item: Block) => {
            let filterItem = _.findWhere(this.blocks, {id: item.id});
            let filterNewItem = _.findWhere(this.newBlocks, {id: item.id});
            if (!filterItem && !filterNewItem) { uniqItems.push(item); }
          });

          if (uniqItems.length) {
            this.newBlocks = _.clone(uniqItems.concat(this.newBlocks));
            if (this.selectedTabIndex == 0) {
              this.newDataAfterUpdateForView = this._service.mapDataForTable(this.newBlocks, appRouteMap.blocks);
            }
          }

          this.processData();

          this.detectChanges();
        }

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get transaction list
   */
  private getTransactions(): void {
    // Get transactions
    this._service.getData(
      this.homeService.getVariablesForTransactions(this.params),
      this.transactionQueries.getTransactions,
      appRouteMap.transactions
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Transaction[]) => {

        res = res ? res : [];

        if (!this.autoupdate) {
          this.transactions = res;
          if (this.selectedTabIndex == 1) {
            this.tableViewerData = this._service.mapDataForTable(this.transactions, appRouteMap.transactions, 10);
          }
          this.tableViewersLoading = false;
          this.filterLoading = false;
          this.initComplete = true;
          this.detectChanges();
        }
        else {
          this.newTransactions = this.newTransactions ? this.newTransactions : [];

          let uniqItems = [];

          res.forEach((item: Transaction) => {
            let filterItem = _.findWhere(this.transactions, {id: item.id});
            let filterNewItem = _.findWhere(this.newTransactions, {id: item.id});
            if (!filterItem && !filterNewItem) { uniqItems.push(item); }
          });

          if (uniqItems.length) {
            this.newTransactions = _.clone(uniqItems.concat(this.newTransactions));
            if (this.selectedTabIndex == 1) {
              this.newDataAfterUpdateForView = this._service.mapDataForTable(this.newTransactions, appRouteMap.transactions);
            }
          }

          this.detectChanges();
        }

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
      value: this.blocks.length ? _.max(_.first(_.clone(this.newBlocks.concat(this.blocks)), 50), function(b){ return b.seq_no; })['seq_no'] : 0,
      isNumber: true,
    });

    const averageBlockTime = new ViewerData({
      title: LocaleText.averageBlockTime,
      value: (this._service.baseFunctionsService.getAverageTime(_.first(_.clone(this.newBlocks.concat(this.blocks)), 50), 'gen_utime') + ' sec').replace('.', ','),
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
