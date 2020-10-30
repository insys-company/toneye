import { Component, ChangeDetectionStrategy, OnInit, AfterViewChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { ValidatorsService } from './validators.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockQueries } from 'src/app/api/queries';
import { ValidatorSet, ViewerData, TabViewerData, BlockMasterConfig, Block, ItemList } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import { LocaleText } from 'src/locale/locale';

@Component({
  selector: 'app-validators',
  templateUrl: './validators.component.html',
  styleUrls: ['./validators.component.scss'],
  animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidatorsComponent extends BaseComponent<any> implements OnInit, AfterViewChecked, OnDestroy {
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
   * For skeleton animation
   */
  public aditionalSkeletonArrayForGeneralViewer: Array<number> = new Array(2);

  /** Общие тексты для страниц */
  public locale = {
    title: LocaleText.validatorsPage,
    general: LocaleText.general,
    loadMore: LocaleText.loadMore,
    autoupdate: LocaleText.autoupdate,
    previous: LocaleText.previous,
    current: LocaleText.current,
    next: LocaleText.next,
    validatorConfig: LocaleText.validatorConfig
  };

  /**
   * Validators
   */
  public previosValidators: ValidatorSet;
  public currentValidators: ValidatorSet;
  public nextValidators: ValidatorSet;

  /**
   * Data for table view
   */
  public tableViewerDataPrev: Array<TabViewerData>;
  public tableViewerDataNext: Array<TabViewerData>;

  /**
   * Aditional Data for view
   */
  public prevViewerData: Array<ViewerData>;

  /**
   * Aditional Data for view
   */
  public currentViewerData: Array<ViewerData>;

  /**
   * Aditional Data for view
   */
  public nextViewerData: Array<ViewerData>;

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
    this.aditionalSkeletonArrayForGeneralViewer = null;
    this.prevBlockKey = null;

    this.previosValidators = null;
    this.currentValidators = null;
    this.nextValidators = null;

    this.tableViewerDataPrev = null;
    this.tableViewerDataNext = null;

    this.prevViewerData = null;
    this.currentViewerData = null;
    this.nextViewerData = null;
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
    this.generalViewerData.push(new ViewerData({title: LocaleText.numberOfCurrentValidators, value: _model.p34.total, isNumber: true}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.electionsStatus, value: 'Closed'}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.electionsStart, value: _model.p34.utime_since, isDate: true}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.nextElectionsStart,value: _model.p34.utime_until, isDate: true}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.electionsEnd, value: _model.p34.utime_since, isDate: true}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.nextElectionsEnd, value: _model.p34.utime_until, isDate: true}));

    this.aditionalViewerData = [];
    // Подзаголовок - будет выделен
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.electionParameters,
      isHeader: true
    }));

    this.aditionalViewerData.push(new ViewerData({title: LocaleText.validatorsElectedFor, value: _model.p15.validators_elected_for != null ? _model.p15.validators_elected_for : '--'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.electionsStartBefore, value: _model.p15.elections_start_before != null ? _model.p15.elections_start_before : '--'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.electionsEndBefore, value: _model.p15.elections_end_before != null ? _model.p15.elections_end_before : '--'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.stakeHeldFor, value: _model.p15.stake_held_for != null ? _model.p15.stake_held_for : '--'}));

    // Подзаголовок - будет выделен
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.validatorsCount,
      isHeader: true
    }));

    this.aditionalViewerData.push(new ViewerData({title: LocaleText.maxMainValidators, value: _model.p16.max_main_validators, isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.maxValidators, value: _model.p16.max_validators, isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.minValidators, value: _model.p16.min_validators, isNumber: true}));

    // Подзаголовок - будет выделен
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.validatorStake,
      isHeader: true
    }));

    this.aditionalViewerData.push(new ViewerData({title: LocaleText.maxStake, value: _model.p17.max_stake, isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.maxStakeFactor, value: _model.p17.max_stake_factor, isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.minStake, value: _model.p17.min_stake, isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.minTotalStake, value: _model.p17.min_total_stake, isNumber: true}));

    this.prevViewerData = [];
    this.prevViewerData.push(new ViewerData({
      title: LocaleText.since,
      value: _model && _model.p32 && _model.p32.utime_since != null ? _model.p32.utime_since : '--',
      isDate:  _model && _model.p32 && _model.p32.utime_since != null
    }));
    this.prevViewerData.push(new ViewerData({
      title: LocaleText.until,
      value: _model && _model.p32 && _model.p32.utime_until != null ? _model.p32.utime_until : '--',
      isDate: _model && _model.p32 && _model.p32.utime_until != null
    }));

    this.currentViewerData = [];
    this.currentViewerData.push(new ViewerData({
      title: LocaleText.since,
      value: _model && _model.p34 && _model.p34.utime_since != null ? _model.p34.utime_since : '--',
      isDate:  _model && _model.p34 && _model.p34.utime_since != null
    }));
    this.currentViewerData.push(new ViewerData({
      title: LocaleText.until,
      value: _model && _model.p34 && _model.p34.utime_until != null ? _model.p34.utime_until : '--',
      isDate: _model && _model.p34 && _model.p34.utime_until != null
    }));

    this.nextViewerData = [];
    this.nextViewerData.push(new ViewerData({
      title: LocaleText.since,
      value: _model && _model.p36 && _model.p36.utime_since != null ? _model.p36.utime_since : '--',
      isDate:  _model && _model.p36 && _model.p36.utime_since != null
    }));
    this.nextViewerData.push(new ViewerData({
      title: LocaleText.until,
      value: _model && _model.p36 && _model.p36.utime_until != null ? _model.p36.utime_until : '--',
      isDate: _model && _model.p36 && _model.p36.utime_until != null
    }));

  }

  /**
   * Get key of previos block
   */
  private getPrevBlockKey(): void {
    this._service.getData(
      this._service.getVariablesForPrevBlockKey(),
      this.blockQueries.getMasterBlockPrevKey,
      appRouteMap.blocks
    )
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
    this._service.getData(
      this._service.getVariablesForPrevBlockConfig(this.prevBlockKey),
      this.blockQueries.getMasterBlockConfig,
      appRouteMap.blocks
    )
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

        this.tableViewerDataPrev = this._service.mapDataForTable(this.previosValidators.list ? this.previosValidators.list : [], appRouteMap.validators, 10, this.previosValidators.total_weight);
        this.tableViewerData = this._service.mapDataForTable(this.currentValidators.list ? this.currentValidators.list : [], appRouteMap.validators, 10, this.currentValidators.total_weight);
        this.tableViewerDataNext = this._service.mapDataForTable(this.nextValidators.list ? this.nextValidators.list : [], appRouteMap.validators, 10, this.nextValidators.total_weight);

        this.tableViewersLoading = false;

        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
  }
}
