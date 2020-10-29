import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { ValidatorDetailsService } from './validator-details.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { TransactionQueries, CommonQueries } from 'src/app/api/queries';
import { Block, ViewerData, Transaction, BlockMasterConfig, BlockMaster, ValidatorSetList, ValidatorSet } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';

const VALIDATOR_PUBLIC_KEY="ed051c4d6384b13b9ad05a507e3d9cf95d4e4ffc338406603709a3dbf6291d46";
@Component({
  selector: 'app-validator-details',
  templateUrl: './validator-details.component.html',
  styleUrls: ['./validator-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidatorDetailsComponent extends BaseComponent<any> implements OnInit, OnDestroy {
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(12);

  /**
   * Blocks
   */
  public signedBlocks: Array<Block>;

  /** For Details component */
  /**
   * Model
   */
  public model: ValidatorSet;
  /**
   * Model
   */
  public validatorModel: ValidatorSetList;
  /**
   * Model
   */
  public masterBlock: BlockMaster;

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected service: ValidatorDetailsService,
    protected route: ActivatedRoute,
    protected router: Router,
    private commonQueries: CommonQueries
  ) {
    super(
      changeDetection,
      service,
      route,
      router,
    );
  }

  /**
   * Initialization of the component
   * For details component
   */
  public initDatails(): void {
    this.route.params
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((params: Params) => {
        this.modelId = params['id'] != null ? params['id'].trim() : null;
        this.modelId = VALIDATOR_PUBLIC_KEY;

        // Get aditional data
        this.getData();

      })
      .unsubscribe();
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.signedBlocks = null;
    this.masterBlock = null;
    this.validatorModel = null;
  }

  /**
   * Export event
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
   * Data for model from other queries
   */
  protected getData(): void {
    // Get master block
    this.service.getData(
      this.service.getVariablesForPrevBlockKey(),
      this._service.graphQueryService['getMasterBlockPrevKey'],
      appRouteMap.blocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Block[]) => {

        if (res && res[0]) {

          this.service.getData(
            this.service.getVariablesForPrevBlockConfig(res[0].prev_key_block_seqno),
            this._service.graphQueryService['getMasterBlockConfig'],
            appRouteMap.blocks
          )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((res: Block[]) => {

              this.masterBlock = res ? new BlockMaster(res[0].master) : new BlockMaster(null);

              if (this.masterBlock.config && this.masterBlock.config.p32 && this.masterBlock.config.p32.list) {
                this.validatorModel = _.find(this.masterBlock.config.p32.list, (item: ValidatorSetList) => { return item.public_key === this.modelId});
                this.model = this.validatorModel ? this.masterBlock.config.p32 : null;
              }

              if (!this.model && this.masterBlock.config && this.masterBlock.config.p34 && this.masterBlock.config.p34.list) {
                this.validatorModel = _.find(this.masterBlock.config.p34.list, (item: ValidatorSetList) => { return item.public_key === this.modelId});
                this.model = this.validatorModel ? this.masterBlock.config.p34 : null;
              }

              if (!this.model && this.masterBlock.config && this.masterBlock.config.p36 && this.masterBlock.config.p36.list) {
                this.validatorModel = _.find(this.masterBlock.config.p36.list, (item: ValidatorSetList) => { return item.public_key === this.modelId});
                this.model = this.validatorModel ? this.masterBlock.config.p36 : null;
              }

              // Aggregate Block Signatures total
              this.service.getAggregateData(
                this.service.getVariablesForAggregateBlockSignaturesTotal(),
                this.commonQueries.getValidatorAggregateBlockSignatures
              )
                .pipe(takeUntil(this._unsubscribe))
                .subscribe((agBS: any) => {

                  const _agBS = agBS.aggregateBlockSignatures[0];

                  // Aggregate Block total
                  this.service.getAggregateData(
                    this.service.getVariablesForAggregateBlocks(this.model ? this.model.utime_until : null, this.model ? this.model.utime_since : null),
                    this.commonQueries.getAggregateBlocks
                  )
                    .pipe(takeUntil(this._unsubscribe))
                    .subscribe((agB: any) => {

                      const _agB = agB.aggregateBlocks[0];

                      this.mapDataForViews(this.masterBlock.config, { agBS: _agBS, agB: _agB });
                      this.viewersLoading = false;
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

        }

    }, (error: any) => {
      console.log(error);
    });

    // Get signatures block list
    this.service.getData(
      this.service.getVariablesForAggregateBlockSignatures(),
      this._service.graphQueryService['getBlocksSignatures'],
      appRouteMap.blocksSignatures
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((sb: Block[]) => {

        this.signedBlocks = sb ? sb : [];

        let ids = [];

        this.signedBlocks.forEach((b: Block) => {
          ids.push(b.id);
        });

        // Get blocks with tr_count (filter by signatures blocks)
        this.service.getData(
          this.service.getVariablesForFilterBlocks(ids),
          this._service.graphQueryService['getBlocks'],
          appRouteMap.blocks
        )
          .pipe(takeUntil(this._unsubscribe))
          .subscribe((b: Block[]) => {

            b = b ? b : [];

            this.signedBlocks.forEach((block: Block) => {
              let _b = _.find(b, (item) => { return item.id === block.id});

              block.seq_no = _b ? _b.seq_no : 0;
              block.tr_count = _b ? _b.tr_count : 0;
              block.workchain_id = _b ? _b.workchain_id : 0;
              block.shard = _b ? _b.shard : '';
            })

            this.tableViewerData = this._service.mapDataForTable(this.signedBlocks, appRouteMap.blocks);

            this.tableViewersLoading = false;

            this.detectChanges();

          }, (error: any) => {
            console.log(error);
          });

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Map for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapDataForViews(_model: BlockMasterConfig, _data: any): void {

    this.validatorModel = this.validatorModel ? this.validatorModel : new ValidatorSetList();

    this.model = this.model ? this.model : new ValidatorSet();

    this.validatorModel.weight = this.validatorModel.weight && this.validatorModel.weight.match('x')
      ? String(parseInt(this.validatorModel.weight, 16))
      : this.validatorModel.weight;

    this.model.total_weight = this.model.total_weight && this.model.total_weight.match('x')
      ? String(parseInt(this.model.total_weight, 16))
      : this.model.total_weight;

    this.generalViewerData = [];
    this.generalViewerData.push(new ViewerData({title: 'Public key hex', value: this.modelId}));
    this.generalViewerData.push(new ViewerData({title: 'Public key base64', value: this.modelId}));
    this.generalViewerData.push(new ViewerData({title: 'ADNL address hex', value: this.validatorModel.adnl_addr ? this.validatorModel.adnl_addr : '--'}));
    this.generalViewerData.push(new ViewerData({title: 'ADNL address base64', value: this.validatorModel.adnl_addr ? this.validatorModel.adnl_addr : '--'}));
    this.generalViewerData.push(new ViewerData({title: 'Node ID hex', value: '--'}));
    this.generalViewerData.push(new ViewerData({title: 'Stake', value: '--'}));
    this.generalViewerData.push(new ViewerData({title: 'Weight', value: Number(((Number(this.validatorModel.weight)/Number(this.model.total_weight))*100).toFixed(2)), isPercent: true}));
    this.generalViewerData.push(new ViewerData({title: 'Utime since', value: this.model.utime_since, isDate: true}));
    this.generalViewerData.push(new ViewerData({title: 'Utime until', value: this.model.utime_until, isDate: true}));
    this.generalViewerData.push(new ViewerData({title: 'Signed masterchain blocks', value: _data.agBS}));
    this.generalViewerData.push(new ViewerData({title: 'Total number of masterchain blocks', value: _data.agB}));
    this.generalViewerData.push(new ViewerData({title: 'Uptime', value: '--'}));
  }
}
