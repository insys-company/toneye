import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { ContractsService } from './contracts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonQueries } from 'src/app/api/queries';
import { ViewerData, TabViewerData, ItemList, DataConfig, Account } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';

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

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: ContractsService,
    protected route: ActivatedRoute,
    protected router: Router,
    private commonQueries: CommonQueries,
  ) {
    super(
      changeDetection,
      _service,
      route,
      router,
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
    // TODO
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
  protected mapDataForViews(_model: any, _data?: any): void {
    this.generalViewerData = [];
    this.generalViewerData.push(new ViewerData({
      title: 'Unique contracts',
      value: this.data.total,
      dinamic: true,
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

              this.tableViewerData.push(_item);

              if (index === this.data.data.length - 1) {

                this.mapDataForViews(null);

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
