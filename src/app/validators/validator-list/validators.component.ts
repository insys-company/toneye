import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { ValidatorsService } from './validators.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockQueries } from 'src/app/api/queries';
import { ValidatorSet, ViewerData, TabViewerData, BlockMasterConfig, Block, ItemList } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';

@Component({
  selector: 'app-validators',
  templateUrl: './validators.component.html',
  styleUrls: ['./validators.component.scss'],
  animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidatorsComponent extends BaseComponent<any> implements OnInit, OnDestroy {
  /**
   * Details or list
   */
  protected listMode: boolean = true;
  /**
   * key of previos block
   */
  protected prevBlockKey: number;
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(6);

  /**
   * Validators
   */
  public previosValidators: ValidatorSet;
  public currentValidators: ValidatorSet;
  public nextValidators: ValidatorSet;

  /**
   * Aditional Data for view
   */
  public p15ViewerData: Array<ViewerData>;
  public p16ViewerData: Array<ViewerData>;
  public p17ViewerData: Array<ViewerData>;

  /**
   * Data for table view
   */
  public tableViewerDataPrev: Array<TabViewerData>;
  public tableViewerDataNext: Array<TabViewerData>;

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected _service: ValidatorsService,
    protected route: ActivatedRoute,
    protected router: Router,
    private blockQueries: BlockQueries,
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
    this.prevBlockKey = null;

    this.previosValidators = null;
    this.currentValidators = null;
    this.nextValidators = null;

    this.p15ViewerData = null;
    this.p16ViewerData = null;
    this.p17ViewerData = null;

    this.tableViewerDataPrev = null;
    this.tableViewerDataNext = null;
  }

  /**
   * Export method
   */
  public onExport(): void {
    // TODO
  }

  /**
   * Change tab
   * @param index Index of selected tab
   */
  public onChangeTab(index: number): void {

    if (index == this.selectedTabIndex) { return; }

    this.selectedTabIndex = index;
    this.tableViewersLoading = true;
    this.tableViewerData = [];
    this.detectChanges();

    this.tableViewerData = index == 0
      ? this.tableViewerDataPrev
      : index == 1
        ? this._service.mapDataForTable(this.currentValidators.list, appRouteMap.validators, 10, this.currentValidators.total_weight)
        : this.tableViewerDataNext;


    const conf = this.data.data[0] && this.data.data[0].master ? this.data.data[0].master.config : null;

    this.aditionalViewerData.push(new ViewerData({
      title: 'Since',
      value: index == 0 ? conf.p32.utime_since : index == 1 ? conf.p34.utime_since : conf.p36.utime_since,
      isDate: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: 'Until', value: index == 0 ? conf.p32.utime_until : index == 1 ? conf.p34.utime_until : (conf.p36 ? conf.p36.utime_until : null),
      isDate: true
    }));


        // this.tableViewerDataPrev = this.mapDataForTable(this.previosValidators.list, appRouteMap.validators, 10, this.previosValidators.total_weight);
        // this.tableViewerData = this.mapDataForTable(this.currentValidators.list, appRouteMap.validators, 10, this.currentValidators.total_weight);
        // this.tableViewerDataNext = this.mapDataForTable(this.nextValidators.list, appRouteMap.validators, 10, this.nextValidators.total_weight);

    this.tableViewersLoading = false;
    this.detectChanges();

  }

  /**
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {
    // TODO
  }

  /**
   * Получение данных
   */
  protected refreshData(): void {
    this.getPrevBlockKey();
  }

  /**
   * Map for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapDataForViews(_model: BlockMasterConfig, _data?: any): void {

    this.generalViewerData = [];
    this.generalViewerData.push(new ViewerData({title: 'Number of current validators', value: _model.p34.total, isNumber: true}));
    this.generalViewerData.push(new ViewerData({title: 'Elections status', value: 'Closed'}));
    this.generalViewerData.push(new ViewerData({title: 'Elections start', value: _model.p34.utime_since, isDate: true}));
    this.generalViewerData.push(new ViewerData({title: 'Next elections start',value: _model.p34.utime_until, isDate: true}));
    this.generalViewerData.push(new ViewerData({title: 'Elections end', value: _model.p34.utime_since, isDate: true}));
    this.generalViewerData.push(new ViewerData({title: 'Next elections end', value: _model.p34.utime_until, isDate: true}));

    this.p15ViewerData = [];
    this.p15ViewerData.push(new ViewerData({title: 'Validators elected for', value: _model.p15.validators_elected_for}));
    this.p15ViewerData.push(new ViewerData({title: 'Elections start before', value: _model.p15.elections_start_before}));
    this.p15ViewerData.push(new ViewerData({title: 'Elections end before', value: _model.p15.elections_end_before}));
    this.p15ViewerData.push(new ViewerData({title: 'Stake held for', value: _model.p15.stake_held_for}));

    this.p16ViewerData = [];
    this.p16ViewerData.push(new ViewerData({title: 'Max main validators', value: _model.p16.max_main_validators, isNumber: true}));
    this.p16ViewerData.push(new ViewerData({title: 'Max validators', value: _model.p16.max_validators, isNumber: true}));
    this.p16ViewerData.push(new ViewerData({title: 'Min validators', value: _model.p16.min_validators, isNumber: true}));

    this.p17ViewerData = [];
    this.p17ViewerData.push(new ViewerData({title: 'Max stake', value: _model.p17.max_stake, isNumber: true}));
    this.p17ViewerData.push(new ViewerData({title: 'Max stake factor', value: _model.p17.max_stake_factor, isNumber: true}));
    this.p17ViewerData.push(new ViewerData({title: 'Min stake', value: _model.p17.min_stake, isNumber: true}));
    this.p17ViewerData.push(new ViewerData({title: 'Min total stake', value: _model.p17.min_total_stake, isNumber: true}));

    this.aditionalViewerData = [];
    this.aditionalViewerData.push(new ViewerData({title: 'Since', value: _model.p32.utime_since, isDate: true}));
    this.aditionalViewerData.push(new ViewerData({title: 'Until', value: _model.p32.utime_until, isDate: true}));
  }

  /**
   * Get key of previos block
   */
  private getPrevBlockKey(): void {
    this._service.getData(this._service.getVariablesForPrevBlockKey(), this.blockQueries.getMasterBlockPrevKey)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Block[]) => {

        this.prevBlockKey = res[0]
          ? res[0].prev_key_block_seqno
          : null;

        if (this.prevBlockKey != null) {
          this.getPrevBlockConfig();
        }

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get config of previos block
   */
  private getPrevBlockConfig(): void {
    this._service.getData(this._service.getVariablesForPrevBlockConfig(this.prevBlockKey), this.blockQueries.getMasterBlockConfig)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Block[]) => {

        /** Master block */
        this.data = new ItemList({
          data: res ? res : [],
          page: 0,
          pageSize: 25,
          total: res ? res.length : 0
        });

        this.previosValidators = this.data.data[0] && this.data.data[0].master && this.data.data[0].master.config
          ? new ValidatorSet(this.data.data[0].master.config.p32)
          : new ValidatorSet();

        this.currentValidators = this.data.data[0] && this.data.data[0].master && this.data.data[0].master.config
          ? new ValidatorSet(this.data.data[0].master.config.p34)
          : new ValidatorSet();

        this.nextValidators = this.data.data[0] && this.data.data[0].master && this.data.data[0].master.config
          ? new ValidatorSet(this.data.data[0].master.config.p36)
          : new ValidatorSet();

        this.mapDataForViews(this.data.data[0] && this.data.data[0].master ? this.data.data[0].master.config : null);

        this.viewersLoading = false;

        this.detectChanges();

        this.tableViewerDataPrev = this._service.mapDataForTable(this.previosValidators.list, appRouteMap.validators, 10, this.previosValidators.total_weight);
        this.tableViewerData = this._service.mapDataForTable(this.currentValidators.list, appRouteMap.validators, 10, this.currentValidators.total_weight);
        this.tableViewerDataNext = this._service.mapDataForTable(this.nextValidators.list, appRouteMap.validators, 10, this.nextValidators.total_weight);

        this.tableViewersLoading = false;

        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
  }
}
