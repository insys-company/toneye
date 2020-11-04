import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { ContractsService } from './contracts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonQueries } from 'src/app/api/queries';
import { ViewerData, TabViewerData, ItemList, DataConfig, Account } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import { LocaleText } from 'src/locale/locale';
import { MatDialog } from '@angular/material/dialog';
import _ from 'underscore';

// const CONTRACT_CSV_HEADER = 'name,code_hash,totalBalances,contractsCount / total,contractsCount / active,contractsCount / recent,id,avatar \n';
const CONTRACT_CSV_HEADER = 'code_hash,totalBalances,contractsCount / total,contractsCount / active,contractsCount / recent \n';
@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContractsComponent extends BaseComponent<any> implements OnInit, OnDestroy {
  /**
   * Details or list
   */
  protected listMode: boolean = true;
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(1);

  /** Общие тексты для страниц */
  public locale = {
    title: LocaleText.contractsPage,
    date: LocaleText.activeInPeriod,
    tons: LocaleText.transactionCountFilterPlaceholder,
    loadMore: LocaleText.loadMore,
    autoupdate: LocaleText.autoupdate,
  };

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: ContractsService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog,
    private commonQueries: CommonQueries,
  ) {
    super(
      changeDetection,
      _service,
      route,
      router,
      dialog
    );
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    super.ngOnDestroy();

    // this.uniqueAccountsIds = null;
  }

  /**
   * Export method
   */
  public onExport(): void {
    let csvContent = CONTRACT_CSV_HEADER;

    let dataString = '';

    if (this.data) {

      this.data.data.forEach((item: Account, i: number) => {
        dataString = `"${item.code_hash ? item.code_hash : 0}",`
        +`"${item.aggregateByBalance ? item.aggregateByBalance : 0}",`
        +`"${item.aggregateByHash ? item.aggregateByHash : 0}",`
        +`"${item.aggregateByType ? item.aggregateByType : 0}",`
        +`"${item.aggregateByMess ? item.aggregateByMess : 0}"`;
  
        csvContent += i < this.tableViewerData.length ? dataString + '\n' : dataString;
      });
   
      this.onDownloadCsv(appRouteMap.contracts, csvContent);
    }
  }

  /**
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {
    return;
  }

  /**
   * Получение данных
   */
  protected refreshData(): void {
    this.getContracts();
  }

  /**
   * Map for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapDataForViews(_model: any[], _data?: any): void {
    this.generalViewerData = [];
    this.generalViewerData.push(new ViewerData({
      title: LocaleText.uniqueContracts,
      value: _model && _model.length ? _model.length : 0,
      isNumber: true
    }));
  }

  /**
   * Get contracts
   */
  private getContracts(): void {

    this.viewersLoading = true;
    this.tableViewersLoading = true;
    this.detectChanges();

    this._service.getAccounts()
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: ItemList<Account>) => {

        this.data = res;

        this.data.data = this.data.data ? this.data.data : [];

        this.tableViewerData = [];

        this.data.data.forEach((item: Account, index: number) => {

          this.getStatistic(item.code_hash, index);
        });

      });
  }

  /**
   * Get statistic by hash
   * @param hash Account's Hash
   * @param index Account's index
   */
  private getStatistic(hash: string, index: number): void {
    // get by balance
    this._service.getAggregateData(
      this._service.getVariablesForAggregateAccounts(this.params, hash, true),
      this.commonQueries.getValidatorAggregateAccounts
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((byBalance: any[]) => {

        // Get by type
        this._service.getAggregateData(
          this._service.getVariablesForAggregateAccounts(this.params, hash, false, true),
          this.commonQueries.getValidatorAggregateAccounts
        )
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((byType: any[]) => {

          // Get by hash only
          this._service.getAggregateData(
            this._service.getVariablesForAggregateAccounts(this.params, hash),
            this.commonQueries.getValidatorAggregateAccounts
          )
          .pipe(takeUntil(this._unsubscribe))
          .subscribe((byHash: any[]) => {

            // Get message
            this._service.getAggregateData(
              this._service.getVariablesForAggregateMessages(this.params, hash),
              this.commonQueries.getAggregateMessages
            )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((mess: any[]) => {

              let _item = new TabViewerData({
                id: hash,
                url: appRouteMap.contract,
                titleLeft: hash,
                subtitleLeft: new DataConfig({
                  text: ``,
                  type: 'string'
                }),
                titleRight: new DataConfig({
                  text: byBalance['aggregateAccounts'][0],
                  icon: true,
                  iconClass: 'icon-gem',
                  type: 'number'
                }),
                subtitleRight: new DataConfig({
                  text: `Contracts: ${byHash['aggregateAccounts'][0]} | Active: ${byType['aggregateAccounts'][0]} | New: ${mess['aggregateMessages'][0]}`,
                  type: 'string'
                })
              });

              this.data.data[index].aggregateByBalance = byBalance['aggregateAccounts'][0] ? byBalance['aggregateAccounts'][0] + '' : '0';
              this.data.data[index].aggregateByHash = byHash['aggregateAccounts'][0] ? byHash['aggregateAccounts'][0] + '' : '0';
              this.data.data[index].aggregateByType = byType['aggregateAccounts'][0] ? byType['aggregateAccounts'][0] + '' : '0';
              this.data.data[index].aggregateByMess = mess['aggregateMessages'][0] ? mess['aggregateMessages'][0] + '' : '0';

              if (
                this.data.data[index].aggregateByBalance != '0'
                && this.data.data[index].aggregateByHash != '0'
                && this.data.data[index].aggregateByType != '0'
                && this.data.data[index].aggregateByMess != '0'
              ) {
                this.tableViewerData.push(_item);
              }

              if (index === this.data.data.length - 1) {

                this.tableViewerData = (_.sortBy(this.tableViewerData, (item) => { return Number(item.titleRight.text) })).reverse();

                this.mapDataForViews(this.tableViewerData);

                this.viewersLoading = false;
            
                this.detectChanges();
        
                this.tableViewersLoading = false;
  
                this.filterLoading = false;
            
                this.detectChanges();
              }

            }, (error: any) => {
              console.log(error);
            });
  
          }, (error: any) => {
            console.log(error);
          });

        }, (error: any) => {
          console.log(error);
        });


      }, (error: any) => {
        console.log(error);
      });
  }
}
