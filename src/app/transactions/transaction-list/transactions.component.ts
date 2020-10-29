import { Component, ChangeDetectionStrategy, OnInit, AfterViewChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { TransactionsService } from './transactions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonQueries, TransactionQueries } from 'src/app/api/queries';
import { ViewerData, ItemList, Transaction } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsComponent extends BaseComponent<Transaction> implements OnInit, AfterViewChecked, OnDestroy {
  /**
   * Details or list
   */
  protected listMode: boolean = true;
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(2);

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: TransactionsService,
    protected route: ActivatedRoute,
    protected router: Router,
    private commonQueries: CommonQueries,
    private transactionQueries: TransactionQueries,
  ) {
    super(
      changeDetection,
      _service,
      route,
      router,
    );
  }

  /**
   * Export method
   */
  public onExport(): void {
    // TODO
  }

  /**
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {
    // // this.tableViewerLoading = true;

    // // this.detectChanges();

    // let date = this.data[this.data.length - 1].now;

    // const _variables = {
    //   filter: {now: {le: date}},
    //   orderBy: [
    //     {path: 'now', direction: 'DESC'},
    //     {path: 'account_addr', direction: 'DESC'},
    //     {path: 'lt', direction: 'DESC'}
    //   ],
    //   limit: 25,
    // }

    // // Get transaction
    // this.transactionsService.getTransaction(_variables)
    //   .pipe(takeUntil(this.unsubscribe))
    //   .subscribe((res: Transaction[]) => {

    //     let newData = this.mapData(res);
    //     this.tableViewerData = _.clone(this.tableViewerData.concat(newData));
    //     // this.tableViewerLoading = false;

    //     this.detectChanges();

    //     // Scroll to bottom
    //     // window.scrollTo(0, document.body.scrollHeight);
      
    //   }, (error: any) => {
    //     console.log(error);
    //   });
  }

  /**
   * Получение данных
   */
  protected refreshData(): void {
    this.getAggregateData();
  }

  /**
   * Get aggregate transsactions count
   */
  private getAggregateData(): void {

    this.viewersLoading = true;
    this.tableViewersLoading = true;
    this.detectChanges();

    this._service.getAggregateData(
      this._service.getVariablesForTransactions(this.params, true),
      this.commonQueries.getAggregateTransactions
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((generalData: any) => {

        this.generalViewerData = [];

        const aggregateTransactions = new ViewerData({
          title: 'Transaction count',
          value: generalData.aggregateTransactions[0] ? generalData.aggregateTransactions[0] : 0,
          isNumber: true
        });

        this.generalViewerData.push(aggregateTransactions);

        this.getTransactions();

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get transaction list
   */
  private getTransactions(): void {

    this._service.getData(
      this._service.getVariablesForTransactions(this.params),
      this.transactionQueries.getTransactions
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Transaction[]) => {

        this.processData(res ? res : []);

      }, (error: any) => {
        console.log(error);
      });

  }

  /**
   * Get general data
   * @param _data Transactions
   */
  private processData(_data: Transaction[]): void {

    /** Transactions */
    this.data = new ItemList({
      data: _data ? _data : [],
      page: 0,
      pageSize: 25,
      total: _data ? _data.length : 0
    });

    const tps = new ViewerData({
      title: 'TPS',
      value: (this._service.baseFunctionsService.getAverageTime(this.data.data, 'now') + ' sec').replace('.', ','),
      isNumber: false,
      dinamic: true
    });

    this.generalViewerData.push(tps);

    this.viewersLoading = false;

    this.detectChanges();

    this.tableViewerData = this._service.mapDataForTable(this.data.data, appRouteMap.transactions, 10);

    this.tableViewersLoading = false;

    this.filterLoading = false;

    this.detectChanges();
  }
}
