import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Block, GeneralViewer, TabViewerData, Transaction, Message, DataConfig } from '../api';
import { appRouteMap } from '../app-route-map';
import { HomeService } from './home.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'underscore';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  /**
   * Для отписок на запросы
   */
  public unsubscribe: Subject<void> = new Subject();
  /**
   * Data for view
   */
  public generalViewerData: Array<GeneralViewer>;
  /**
   * Data for view
   */
  public tableViewerData: Array<TabViewerData>;
  /**
   * For skeleton animation
   */
  public skeletonArray: Array<number> = new Array(6);
  /**
   * Flag for main info
   */
  public isInfoOpen: boolean;
  /**
   * Flag for loading data of General Viewer
   */
  public generalViewerLoading: boolean;
  /**
   * Flag for loading data of Tabs Viewer
   */
  public tableViewerLoading: boolean;
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
   * For button in info
   */
  public get infoBtnPlaceholder(): string {
    return !this.isInfoOpen ? 'More info' : 'Less info';
  }

  constructor(
    private changeDetection: ChangeDetectorRef,
    private homeService: HomeService,
    private router: Router,
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

    this.isInfoOpen = false;

    /** Loading animation in children */
    this.generalViewerLoading = true;
    this.tableViewerLoading = true;
  }

  /**
   * Initialization of the component
   */
  ngOnInit(): void {
    this.detectChanges();
    this.init();
  }

  /**
   * Destruction of the component
   */
  ngOnDestroy(): void {
    // TODO
  }

  /**
   * Show/Hide info about TON
   */
  onShowInfo(): void {
    this.isInfoOpen = !this.isInfoOpen;
    this.detectChanges();
  }

  /**
   * Export event
   */
  onExport(): void {
    // TODO
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  onSeeMore(index: number): void {

    // Scroll to top
    window.scrollTo({top: 0, behavior: 'smooth'});

    this.router.navigate([`${index == 0 ? appRouteMap.blocks : index == 1 ? appRouteMap.transactions : appRouteMap.messages}`]);
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  onSelectTab(index: number): void {

    this.tableViewerLoading = true;
    this.tableViewerData = [];
    this.detectChanges();

    this.tableViewerData = index == 0 ? this.mapBlocks(this.blocks) : index == 1 ? this.mapTransactions(this.transactions) : this.mapMessages(this.messages);

    this.tableViewerLoading = false;
    this.detectChanges();

  }

  /**
   * Init method
   */
  private init(): void {

    this.homeService.getGeneralData()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((generalData: any) => {

        const aggregateTransactions = new GeneralViewer({
          title: 'Total transaction count',
          value: generalData.aggregateTransactions[0] ? generalData.aggregateTransactions[0] : 0,
          isNumber: true
        });
        const getAccountsCount = new GeneralViewer({
          title: 'Accounts',
          value: generalData.getAccountsCount ? generalData.getAccountsCount : 0,
          isNumber: true
        });
        const getAccountsTotalBalance = new GeneralViewer({
          title: 'Coins',
          value: generalData.getAccountsTotalBalance ? generalData.getAccountsTotalBalance : 0,
          isNumber: true
        });

        // Get master block
        this.homeService.getMasterBlock()
        .pipe(takeUntil(this.unsubscribe))
          .subscribe((masterBlock: any) => {

            const shards = new GeneralViewer({
              title: 'Workchain shards',
              value: masterBlock[0].master && masterBlock[0].master.shard_hashes
                ? masterBlock[0].master.shard_hashes.length
                : 0,
              isNumber: true,
              // dinamic: true
            });

            // Get blocks
            this.homeService.getBlocks()
              .pipe(takeUntil(this.unsubscribe))
              .subscribe((res: Block[]) => {

                this.blocks = res ? res : [];

                const headBlocks = new GeneralViewer({
                  title: 'Head blocks',
                  value: this.blocks.length ? _.max(this.blocks, function(b){ return b.seq_no; })['seq_no'] : 0,
                  isNumber: true,
                  dinamic: true
                });

                const averageBlockTime = new GeneralViewer({
                  title: 'Average block time',
                  value: (this.getAverageBlockTime(this.blocks) + ' sec').replace('.', ','),
                  isNumber: false,
                  dinamic: true
                });

                this.generalViewerData = [];

                this.generalViewerData.push(headBlocks);
                this.generalViewerData.push(averageBlockTime);
                this.generalViewerData.push(shards);
                this.generalViewerData.push(aggregateTransactions);
                this.generalViewerData.push(getAccountsCount);
                this.generalViewerData.push(getAccountsTotalBalance);

                this.generalViewerLoading = false;

                this.detectChanges();
        
                this.tableViewerData = this.mapBlocks(this.blocks);

                this.tableViewerLoading = false;

                this.detectChanges();

              }, (error: any) => {
                console.log(error);
              });
    
          }, (error: any) => {
            console.log(error);
          });


      }, (error: any) => {
        console.log(error);
      });

    // Get messages
    this.homeService.getMessages()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: Message[]) => {

        this.messages = res ? res : [];

      }, (error: any) => {
        console.log(error);
      });

    // Get transaction
    this.homeService.getTransaction()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: Transaction[]) => {

        this.transactions = res ? res : [];

      }, (error: any) => {
        console.log(error);
      });

  }

  /**
   * Map blocks for table
   * @param _blocks Array of blocks
   */
  private mapBlocks(_blocks: Block[]): TabViewerData[] {
    if (!_blocks || !_blocks.length) { return []; }

    let data = [];
    data = _blocks.map((b: Block, i) => {
      return new TabViewerData({
        id: b.id,
        url: appRouteMap.block,
        titleLeft: b.seq_no,
        subtitleLeft: new DataConfig({text: `${b.workchain_id}:${b.shard ? b.shard.substring(0, 3) : b.shard}`, type: 'string'}),
        titleRight: new DataConfig({text: (b.tr_count ? b.tr_count : ''), icon: true, iconClass: 'icon-transactions', type: 'number'}),
        subtitleRight: new DataConfig({text: b.gen_utime, type: 'date'})
      });
    });

    data = _.clone(_.first(data, 10))

    return data;
  }

  /**
   * Get average time
   * @param _blocks Array of blocks
   */
  private getAverageBlockTime(_blocks: Block[]): number {
    if (!_blocks || !_blocks.length) { return 0; }

    let averageTime = 0;

    _blocks.forEach((b: Block, i: number) => {
      if (_blocks[i+1]) {
        averageTime += b.gen_utime - _blocks[i+1].gen_utime;
      }
    });

    averageTime = averageTime/_blocks.length;

    return Number(averageTime.toFixed(1));
  }

  /**
   * Map transactions for table
   * @param _transactions Array of transactions
   */
  private mapTransactions(_transactions: Transaction[]): TabViewerData[] {
    if (!_transactions || !_transactions.length) { return []; }

    let data = [];
    data = _transactions.map((t: Transaction, i: number) => {

      t.balance_delta = t.balance_delta && t.balance_delta.match('x') ? String(parseInt(t.balance_delta, 16)) : t.balance_delta;

      const residue = i % 2;

      return new TabViewerData({
        id: t.id,
        url: appRouteMap.transaction,
        titleLeft: t.id,
        subtitleLeft: new DataConfig({
          text: t.account_addr ? t.account_addr.substring(0, 6) : '',
          type: 'string'
        }),
        titleRight: new DataConfig({
          text: t.tr_type == 3 ? 'Tock' : t.tr_type == 2 ? 'Tick' : t.balance_delta,
          icon: (t.balance_delta && t.balance_delta != '0') ? true : false,
          iconClass: 'icon-gem',
          textColorClass: (t.balance_delta && t.balance_delta != '0') ? '' : 'color-gray',
          type: (t.balance_delta && t.balance_delta != '0') ? 'number' : 'string'
        }),
        subtitleRight: new DataConfig({text: t.now, type: 'date'})
      });
    });

    data = _.clone(_.first(data, 10))

    return data;
  }

  /**
   * Map messages for table
   * @param _messages Array of messages
   */
  private mapMessages(_messages: Message[]): TabViewerData[] {
    if (!_messages || !_messages.length) { return []; }

    let data = [];
    data = _messages.map((m: Message, i: number) => {

      m.value = m.value && m.value.match('x') ? String(parseInt(m.value, 16)) : m.value;

      return new TabViewerData({
        id: m.id,
        url: appRouteMap.message,
        titleLeft: m.id,
        subtitleLeft: new DataConfig({
          text: `${(!m.src || m.src == '') ? 'ext' : m.src.substring(0, 6)} -> ${(!m.dst || m.dst == '') ? 'ext' : m.dst.substring(0, 6)}`,
          type: 'string'
        }),
        titleRight: new DataConfig({text: m.value, icon: true, iconClass: 'icon-gem', type: 'number'}),
        subtitleRight: new DataConfig({text: m.created_at, type: 'date'})
      });
    });

    data = _.clone(_.first(data, 10))

    return data;
  }

  /**
   * Detect Changes
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
