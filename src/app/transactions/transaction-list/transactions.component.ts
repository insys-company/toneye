import { Component, ChangeDetectionStrategy, OnInit, AfterViewChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { TransactionsService } from './transactions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonQueries, TransactionQueries } from 'src/app/api/queries';
import { ViewerData, ItemList, Transaction } from 'src/app/api';
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

  // /**
  //  * Export method
  //  */
  // public onExport(): void {
  //   const dialogRef = this.dialog.open(ExportDialogomponent, this.getCommonDialogOption('400'));

  //   dialogRef.componentInstance.filterParams = this.filterParams ? JSON.parse(JSON.stringify(this.filterParams)) : new SimpleDataFilter();
  //   dialogRef.componentInstance.data = null;
  //   dialogRef.componentInstance.availabledDataCount = this.dataSource ? this.dataSource.total : 0;

  //   dialogRef.afterClosed().subscribe((wereThereAnyChanges: boolean) => {

  //     if (wereThereAnyChanges) {
  //       if (this.filterComponent) {
  //         this.filterComponent.updateListsFromParent();
  //       }
  //       /** После закрытия окна обновляем данные */
  //       this.service.refreshData();
  //     }

  //   });
  // }

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
      title: LocaleText.tps,
      value: (this._service.baseFunctionsService.getAverageTime(this.data.data, 'now') + ' sec').replace('.', ','),
      isNumber: false
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
