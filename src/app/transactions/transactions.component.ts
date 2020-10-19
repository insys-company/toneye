import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Transaction, GeneralViewer, TabViewerData, DataConfig, QueryOrderBy } from '../api';
import { TransactionsService } from './transactions.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'underscore';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsComponent implements OnInit, OnDestroy {
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
  public skeletonArray: Array<number> = new Array(2);
  /**
   * Flag for loading data of General Viewer
   */
  public generalViewerLoading: boolean;
  /**
   * Flag for loading data of Tabs Viewer
   */
  public tableViewerLoading: boolean;

  /** Array of ... */
  public data: Transaction[] = [];

  constructor(
    private changeDetection: ChangeDetectorRef,
    private transactionsService: TransactionsService,
    private router: Router,
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

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

    this.tableViewerLoading = true;

    this.detectChanges();

    let date = this.data[this.data.length - 1].now;

    const _variables = {
      filter: {now: {le: date}},
      limit: 25,
      orderBy: [
        new QueryOrderBy({path: 'now', direction: 'DESC'}),
        new QueryOrderBy({path: 'account_addr', direction: 'DESC'}),
        new QueryOrderBy({path: 'lt', direction: 'DESC'})
      ]
    }

    // Get transaction
    this.transactionsService.getTransaction(_variables)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((res: Transaction[]) => {

        let newData = this.mapData(res);
        this.tableViewerData = _.clone(this.tableViewerData.concat(newData));
        this.tableViewerLoading = false;

        this.detectChanges();

        // Scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
      
      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Init method
   */
  private init(): void {

    this.transactionsService.getGeneralData()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((generalData: any) => {

        const aggregateTransactions = new GeneralViewer({
          title: 'Transaction count',
          value: generalData.aggregateTransactions[0] ? generalData.aggregateTransactions[0] : 0,
          isNumber: true
        });

        // Get messages
        this.transactionsService.getTransaction()
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((res: Transaction[]) => {

            this.data = res ? res : [];

            const tps = new GeneralViewer({
              title: 'TPS',
              value: (this.getAverageTime(this.data) + ' sec').replace('.', ','),
              isNumber: false,
              dinamic: true
            });

            this.generalViewerData = [];

            this.generalViewerData.push(aggregateTransactions);
            this.generalViewerData.push(tps);

            this.generalViewerLoading = false;

            this.detectChanges();
    
            this.tableViewerData = this.mapData(this.data);

            this.tableViewerLoading = false;

            this.detectChanges();

          }, (error: any) => {
            console.log(error);
          });


      }, (error: any) => {
        console.log(error);
      });

  }

  /**
   * Get average time
   * @param _list Array of items
   */
  private getAverageTime(_list: Transaction[]): number {
    if (!_list || !_list.length) { return 0; }

    let averageTime = 0;

    _list.forEach((item: Transaction, i: number) => {

      // item.balance_delta = item.balance_delta && item.balance_delta.match('x') ? String(parseInt(item.balance_delta, 16)) : item.balance_delta;

      if (_list[i+1]) {
        averageTime += item.now - _list[i+1].now;
      }
    });

    averageTime = averageTime/_list.length;

    return Number(averageTime.toFixed(1));
  }

  /**
   * Map transactions for table
   * @param _list Array of transactions
   */
  private mapData(_list: Transaction[]): TabViewerData[] {
    if (!_list || !_list.length) { return []; }

    let data = [];
    data = _list.map((t: Transaction, i: number) => {

      t.balance_delta = t.balance_delta && t.balance_delta.match('x') ? String(parseInt(t.balance_delta, 16)) : t.balance_delta;

      const residue = i % 2;

      return new TabViewerData({
        titleLeft: t.id,
        subtitleLeft: new DataConfig({
          text: t.account_addr ? t.account_addr.substring(0, 6) : '',
          type: 'string'
        }),
        titleRight: new DataConfig({
          text: t.balance_delta && t.balance_delta != '0' ? t.balance_delta : residue == 0 ? 'Tock' : 'Tick',
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
   * Detect Changes
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
