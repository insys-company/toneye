import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { ValidatorDetailsService } from './validator-details.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CommonQueries, BlockQueries } from 'src/app/api/queries';
import { Block, ViewerData, BlockMasterConfig, BlockMaster, ValidatorSetList, ValidatorSet, SimpleDataFilter, ItemList } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';
import { LocaleText } from 'src/locale/locale';
import { MatDialog } from '@angular/material/dialog';
import { ExportDialogomponent } from 'src/app/shared/components';

import Buffer from 'buffer';
import Sha256 from 'js-sha256';

const VALIDATOR_PUBLIC_KEY="26da72ac2e7b1e29b25dae037154043c774f891fe67e5f9f452f2356f7e1cae1";
const NODE_ID="b1fc03f1056ea04fde998a2bc1725c405f36b18361d9066b01181aad9bfed02f";
@Component({
  selector: 'app-validator-details',
  templateUrl: './validator-details.component.html',
  styleUrls: ['./validator-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidatorDetailsComponent extends BaseComponent<any> implements OnInit, OnDestroy {
  /** Общие тексты для страниц */
  public locale = {
    title: LocaleText.validatorPage,
    loadMore: LocaleText.loadMore,
    autoupdate: LocaleText.autoupdate,
    moreDetails: LocaleText.moreDetails,
    signed: LocaleText.valodatorTableTitle
  };

  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(12);

  /**
   * Blocks
   */
  public blocks: ItemList<Block>;

  /** For Details component */
  /**
   * All Validator data
   */
  public validatorData: ValidatorSet;
  /**
   * Validator without data
   */
  public model: ValidatorSetList;
  /**
   * Master block
   */
  public masterBlock: BlockMaster;

  /**
   * Node id from public key
   */
  public nodeId: string | number;

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected service: ValidatorDetailsService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog,
    private commonQueries: CommonQueries,
    private blockQueries: BlockQueries,
  ) {
    super(
      changeDetection,
      service,
      route,
      router,
      dialog
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

        this.nodeId = this.modelId != null ? Sha256.sha256(Buffer.Buffer.from(this.modelId+'', 'hex')) : null;

        this.nodeId  = NODE_ID;

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
    this.blocks = null;
    this.masterBlock = null;
    this.validatorData = null;
    this.nodeId = null;
  }

  /**
   * Export method
   */
  public onExport(): void {
    const dialogRef = this.dialog.open(ExportDialogomponent, this.getCommonDialogOption());

    dialogRef.componentInstance.params = this.params ? _.clone(this.params) : new SimpleDataFilter();
    dialogRef.componentInstance.data = this.blocks && this.blocks.data ? _.first(this.blocks.data, 1) : [];
    dialogRef.componentInstance.parentId = this.nodeId;
    dialogRef.componentInstance.listName = appRouteMap.blocksSignatures;
  }

  /**
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {
    this.tableViewersLoading = true;
    this.detectChanges();

    let date = this.blocks && this.blocks.data ? _.last(this.blocks.data).gen_utime : null;

    // Get signatures block list
    this.service.getData(
      this.service.getVariablesForBlockSignatures(this.nodeId, date, 25),
      this.blockQueries.getBlocksSignatures,
      appRouteMap.blocksSignatures
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((sb: Block[]) => {

        sb = sb ? sb : [];

        // hide load more btn
        if (!sb.length || sb.length < 25) {
          this.isFooterVisible = false;
        }

        let ids = [];

        sb.forEach((b: Block) => {
          ids.push(b.id);
        });

        if (!ids.length) {

          this.tableViewerData = this.tableViewerData ? this.tableViewerData : [];
          this.tableViewersLoading = false;
          this.detectChanges();

        }
        else {

          // Get blocks with tr_count (filter by signatures blocks)
          this.service.getData(
            this.service.getVariablesForFilterBlocks(ids),
            this.blockQueries.getBlocks,
            appRouteMap.blocks
          )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((fb: Block[]) => {

              fb = fb ? fb : [];

              sb.forEach((block: Block) => {
                let _b = _.find(fb, (item) => { return item.id === block.id});

                block.seq_no = _b ? _b.seq_no : 0;
                block.tr_count = _b ? _b.tr_count : 0;
                block.workchain_id = _b ? _b.workchain_id : 0;
                block.shard = _b ? _b.shard : '';
              });

              this.blocks.data = _.union(this.blocks.data, sb);
              this.blocks.data = _.uniq(this.blocks.data, 'id');
              this.blocks.total = this.blocks.data.length;

              this.tableViewerData = [];

              this.tableViewerData = this._service.mapDataForTable(this.blocks.data, appRouteMap.blocks);

              this.tableViewersLoading = false;
              this.detectChanges();

            }, (error: any) => {
              console.log(error);
            });

        }

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Data for model from other queries
   */
  protected getData(): void {
    // Get master block
    this.service.getData(
      this.service.getVariablesForPrevBlockKey(),
      this.blockQueries.getMasterBlockPrevKey,
      appRouteMap.blocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Block[]) => {

        if (res && res[0]) {

          this.service.getData(
            this.service.getVariablesForPrevBlockConfig(res[0].prev_key_block_seqno),
            this.blockQueries.getMasterBlockConfig,
            appRouteMap.blocks
          )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((master: Block[]) => {

              this.masterBlock = master && master[0] ? new BlockMaster(master[0].master) : new BlockMaster();

              if (this.masterBlock.config && this.masterBlock.config.p32 && this.masterBlock.config.p32.list) {
                this.model = _.find(this.masterBlock.config.p32.list, (item: ValidatorSetList) => { return item.public_key === this.modelId });
                this.validatorData = this.model != null ? this.masterBlock.config.p32 : null;
              }

              if (!this.model && this.masterBlock.config && this.masterBlock.config.p34 && this.masterBlock.config.p34.list) {
                this.model = _.find(this.masterBlock.config.p34.list, (item: ValidatorSetList) => { return item.public_key === this.modelId });
                this.validatorData = this.model != null ? this.masterBlock.config.p34 : null;
              }

              if (!this.model && this.masterBlock.config && this.masterBlock.config.p36 && this.masterBlock.config.p36.list) {
                this.model = _.find(this.masterBlock.config.p36.list, (item: ValidatorSetList) => { return item.public_key === this.modelId });
                this.validatorData = this.model != null ? this.masterBlock.config.p36 : null;
              }



              if (!this.model) {
                this.tableViewersLoading = false;
                this.detectChanges();
              }
              else {
                this.getAggregateData();
              }

            }, (error: any) => {
              console.log(error);
            });

        }

    }, (error: any) => {
      console.log(error);
    });

    this.getBlocks();
  }

  /**
   * Map for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapDataForViews(_model: BlockMasterConfig, _data: { agBS: number, agB: number }): void {

    this.model = this.model ? this.model : new ValidatorSetList();

    this.validatorData = this.validatorData ? this.validatorData : new ValidatorSet();
    
    let _publicKeyBase64 = Buffer.Buffer.from(this.modelId + '', 'hex').toString('base64');

    let _adnlAddressBase64 = this.model.adnl_addr != null ? Buffer.Buffer.from(this.model.adnl_addr, 'hex').toString('base64') : '--';
    
    // console.log(Sha256.sha256(Buffer.Buffer.from(this.modelId+'', 'hex')));
    // console.log(Sha256.sha256(this.modelId+''));

    this.model.weight = this.model.weight
      ? String(parseInt(this.model.weight, 16))
      : '0';

    this.validatorData.total_weight = this.validatorData.total_weight
      ? String(parseInt(this.validatorData.total_weight, 16))
      : '0';

    let _weight = Number(((Number(this.model.weight)/Number(this.validatorData.total_weight))*100).toFixed(2));

    let _stake = Number(this.model.weight);

    this.generalViewerData = [];
    this.generalViewerData.push(new ViewerData({title: LocaleText.publicKeyHex, value: this.modelId}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.publicKeyBase64, value: _publicKeyBase64}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.adnlAddressHex, value: this.model.adnl_addr != null ? this.model.adnl_addr : '--'}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.adnlAddressBase64, value: _adnlAddressBase64}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.nodeIDHex, value: this.nodeId}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.stake, value: _stake ? _stake : 0, isNumber: true}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.weight, value: _weight ? _weight : 0, isPercent: true}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.utimeSince, value: this.validatorData.utime_since != null ? this.validatorData.utime_since : '--', isDate: this.validatorData.utime_since != null}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.utimeUntil, value: this.validatorData.utime_until != null ? this.validatorData.utime_until : '--', isDate: this.validatorData.utime_until != null}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.signedMasterchainBlocks, value: _data.agBS ? _data.agBS : 0, isNumber: true}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.totalNumberOfMasterchainBlocks, value: _data.agB ? _data.agB : 0, isNumber: true}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.uptime, value: ((_data.agBS ? _data.agBS : 0)/(_data.agB ? _data.agB : 0)).toFixed(9)}));
  }

  /**
   * Get aggregate data count
   */
  private getAggregateData(): void {
    // Aggregate Block Signatures total
    this.service.getAggregateData(
      this.service.getVariablesForAggregateBlockSignaturesTotal(this.nodeId),
      this.commonQueries.getValidatorAggregateBlockSignatures
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((agBS: any) => {

        const _agBS = agBS.aggregateBlockSignatures[0];

        // Aggregate Block total
        this.service.getAggregateData(
          this.service.getVariablesForAggregateBlocks(this.validatorData ? this.validatorData.utime_until : null, this.validatorData ? this.validatorData.utime_since : null),
          this.commonQueries.getAggregateBlocks
        )
          .pipe(takeUntil(this._unsubscribe))
          .subscribe((agB: any) => {

            const _agB = agB.aggregateBlocks[0];

            this.mapDataForViews(this.masterBlock.config, { agBS: Number(_agBS), agB: Number(_agB) });

            this.viewersLoading = false;
            this.detectChanges();

          }, (error: any) => {
            console.log(error);
          });

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Get blocks
   */
  private getBlocks(): void {
    // Get signatures block list
    this.service.getData(
      this.service.getVariablesForBlockSignatures(this.nodeId),
      this.blockQueries.getBlocksSignatures,
      appRouteMap.blocksSignatures
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((sb: Block[]) => {

        // hide load more btn
        if (!sb.length || sb.length <= 25) {
          this.isFooterVisible = false;
        }

        this.blocks = new ItemList({
          data: sb ? sb : [],
          page: 0,
          pageSize: 25,
          total: sb ? sb.length : 0
        });

        this.blocks.data = _.first(this.blocks.data, 25);

        let ids = [];

        this.blocks.data.forEach((b: Block) => {
          ids.push(b.id);
        });

        if (!ids.length) {

          this.tableViewerData = [];
          this.tableViewersLoading = false;
          this.detectChanges();

        }
        else {

          // Get simple blocks
          this.service.getData(
            this.service.getVariablesForFilterBlocks(ids),
            this.blockQueries.getBlocks,
            appRouteMap.blocks
          )
            .pipe(takeUntil(this._unsubscribe))
            .subscribe((fb: Block[]) => {

              fb = fb ? fb : [];

              this.blocks.data.forEach((block: Block) => {
                let _b = _.find(fb, (item) => { return item.id === block.id});

                block.seq_no = _b ? _b.seq_no : 0;
                block.tr_count = _b ? _b.tr_count : 0;
                block.workchain_id = _b ? _b.workchain_id : 0;
                block.shard = _b ? _b.shard : '';
              });

              this.tableViewerData = this._service.mapDataForTable(this.blocks.data, appRouteMap.blocks, 25);

              this.tableViewersLoading = false;

              this.detectChanges();

            }, (error: any) => {
              console.log(error);
            });

        }

      }, (error: any) => {
        console.log(error);
      });
  }
}
