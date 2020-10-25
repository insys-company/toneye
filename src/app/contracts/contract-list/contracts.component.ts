import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { ContractsService } from './contracts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockQueries, CommonQueries } from 'src/app/api/queries';
import { ValidatorSet, ViewerData, TabViewerData, BlockMasterConfig, Block, ItemList, DataConfig } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';

const HASH="80d6c47c4a25543c9b397b71716f3fae1e2c5d247174c52e2c19bd896442b105";
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

  /**
   * Ids
   */
  public uniqueAccountsIds: Array<string> = [ HASH ];

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
    // this.prevBlockKey = null;

    // this.previosValidators = null;
    // this.currentValidators = null;
    // this.nextValidators = null;

    // this.p15ViewerData = null;
    // this.p16ViewerData = null;
    // this.p17ViewerData = null;

    // this.tableViewerDataPrev = null;
    // this.tableViewerDataNext = null;
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

    // let balance = this.data[this.data.length - 1].balance;

    // balance = balance && balance.match('x') ? String(parseInt(balance, 16)) : balance;

    // const _variables = {
    //   filter: {balance: {le: balance}},
    //   orderBy: [{path: 'balance', direction: 'DESC'}],
    //   limit: 25,
    // }

    // // Get accounts
    // this.contractsService.getAccounts(_variables)
    //   .pipe(takeUntil(this.unsubscribe))
    //   .subscribe((res: Account[]) => {

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

    this.tableViewerData = [];


    this.uniqueAccountsIds.forEach((id: string) => {

      this._service.getAggregateData(this._service.getVariablesForAggregateAccountsByBalance(id), this.commonQueries.getValidatorAggregateAccounts)
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((byBalance: any[]) => {

          this._service.getAggregateData(this._service.getVariablesForAggregateAccountsByType(id), this.commonQueries.getValidatorAggregateAccounts)
          .pipe(takeUntil(this._unsubscribe))
          .subscribe((byType: any[]) => {

            this._service.getAggregateData(this._service.getVariablesForAggregateAccountsByHash(id), this.commonQueries.getValidatorAggregateAccounts)
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((byHash: any[]) => {

              this._service.getAggregateData(this._service.getVariablesForAggregateMessages(id), this.commonQueries.getAggregateMessages)
              .pipe(takeUntil(this._unsubscribe))
              .subscribe((mess: any[]) => {

                let t = new TabViewerData({
                  id: HASH,
                  url: appRouteMap.contract,
                  titleLeft: HASH,
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

                this.tableViewerData.push(t);

                this.tableViewersLoading = false;
                this.detectChanges();
        
                this.mapDataForViews(null);
        
                this.viewersLoading = false;
                this.detectChanges();

                // setTimeout(() => {this.detectChanges();}, 3000);
      
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


    });
  }

  /**
   * Map for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapDataForViews(_model: any, _data?: any): void {
    this.generalViewerData = [];
    this.generalViewerData.push(new ViewerData({title: 'Unique contracts', value: 1, isNumber: true}));
  }
}
