import { Component, ChangeDetectionStrategy, OnInit, AfterViewChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { TransactionsService } from './transactions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonQueries, TransactionQueries } from 'src/app/api/queries';
import { ViewerData, ItemList, Transaction, SimpleDataFilter } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';
import { LocaleText } from 'src/locale/locale';
import { MatDialog } from '@angular/material/dialog';

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

  /** Общие тексты для страниц */
  public locale = {
    title: LocaleText.transactionsPage,
    date: LocaleText.timeFilterPlaceholder,
    tons: LocaleText.tonCountFilterPlaceholder,
    loadMore: LocaleText.loadMore,
    autoupdate: LocaleText.autoupdate,
    items: LocaleText.transactions
  };

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: TransactionsService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog,
    private commonQueries: CommonQueries,
    private transactionQueries: TransactionQueries,
  ) {
    super(
      changeDetection,
      _service,
      route,
      router,
      dialog,
    );
  }

  /**
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {
    this.tableViewersLoading = true;

    this.detectChanges();

    let date = this.data && this.data.data ? _.last(this.data.data).now : null;

    let _p = this.params ?  _.clone(this.params) : new SimpleDataFilter();

    _p.toDate = date + '';

    this._service.getData(
      this._service.getVariablesForTransactions(_p, false, 25),
      this.transactionQueries.getTransactions
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Transaction[]) => {

        this.data.data = this.data.data.concat(res ? res : []);
        this.data.total = this.data.data.length;

        this.tableViewerData = this._service.mapDataForTable(this.data.data, appRouteMap.transactions);

        this.tableViewersLoading = false;

        this.filterLoading = false;

        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
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

    if (!this.autoupdate) {
      this.viewersLoading = true;
      this.tableViewersLoading = true;
      this.detectChanges();
    }

    this._service.getAggregateData(
      this._service.getVariablesForTransactions(this.params, true),
      this.commonQueries.getAggregateTransactions
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((generalData: any) => {

        this.generalViewerData = [];

        const aggregateTransactions = new ViewerData({
          title: LocaleText.transactionCount,
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

        res = res ? res : [];

        if (!this.autoupdate) {
          this.processData(res);
        }
        else {
          this.newDataAfterUpdate = this.newDataAfterUpdate ? this.newDataAfterUpdate : [];

          let uniqItems = [];

          res.forEach((item: Transaction) => {
            let filterItem = _.findWhere(this.data.data, {id: item.id});
            let filterNewItem = _.findWhere(this.newDataAfterUpdate, {id: item.id});
            if (!filterItem && !filterNewItem) { uniqItems.push(item); }
          });

          if (uniqItems.length) {
            this.newDataAfterUpdate = _.clone(uniqItems.concat(this.newDataAfterUpdate));
            this.newDataAfterUpdateForView = this._service.mapDataForTable(this.newDataAfterUpdate, appRouteMap.transactions);
          }

          const tps = new ViewerData({
            title: LocaleText.tps,
            value: (this._service.baseFunctionsService.getAverageTime(_.first(_.clone(this.newDataAfterUpdate.concat(this.data.data)), 50), 'now') + '').replace('.', ','),
            isNumber: false
          });

          this.generalViewerData = this.generalViewerData.splice(0, 1);
        
          this.generalViewerData.push(tps);

          this.detectChanges();
        }

      }, (error: any) => {
        console.log(error);
      });

  }

  /**
   * Get general data
   * @param _data Transactions
   */
  private processData(_data: Transaction[]): void {

    this.newDataAfterUpdate = [];
    this.newDataAfterUpdateForView = [];

    /** Transactions */
    this.data = new ItemList({
      data: _data ? _data : [],
      page: 0,
      pageSize: 25,
      total: _data ? _data.length : 0
    });

    const tps = new ViewerData({
      title: LocaleText.tps,
      value: (this._service.baseFunctionsService.getAverageTime(this.data.data, 'now') + '').replace('.', ','),
      isNumber: false
    });

    this.generalViewerData.push(tps);

    this.viewersLoading = false;

    this.detectChanges();

    this.tableViewerData = this._service.mapDataForTable(this.data.data, appRouteMap.transactions, 25);

    this.tableViewersLoading = false;

    this.filterLoading = false;

    this.detectChanges();
  }

  /**
   * Change general data
   */
  private setChangeData(): void {
    // TODO
  }
}
