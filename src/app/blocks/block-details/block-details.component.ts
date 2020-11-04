import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { BlockDetailsService } from './block-details.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { TransactionQueries, BlockQueries } from 'src/app/api/queries';
import { Block, ViewerData, Transaction, MsgData, TabViewerData, SimpleDataFilter } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';
import { LocaleText } from 'src/locale/locale';
import { MatDialog } from '@angular/material/dialog';
import { ExportDialogomponent } from 'src/app/shared/components';

const IN_MSG_CSV_HEADER = 'msg_type,msg_type_name,fwd_fee,transaction_id,__typename,in_msg / msg_id,in_msg / next_addr,in_msg / cur_addr,in_msg / fwd_fee_remaining,in_msg \n';
const OUT_MSG_CSV_HEADER = 'msg_type,msg_type_name,fwd_fee,transaction_id,__typename,out_msg / msg_id,out_msg / next_addr,out_msg / cur_addr,out_msg / fwd_fee_remaining,out_msg \n';
@Component({
  selector: 'app-block-details',
  templateUrl: './block-details.component.html',
  styleUrls: ['./block-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockDetailsComponent extends BaseComponent<Block> implements OnInit, OnDestroy {

  /** Общие тексты для страниц */
  public locale = {
    title: LocaleText.blockPage,
    date: LocaleText.timeFilterPlaceholder,
    tons: LocaleText.tonCountFilterPlaceholder,
    loadMore: LocaleText.loadMore,
    autoupdate: LocaleText.autoupdate,
    moreDetails: LocaleText.moreDetails,
    valueFlowGroup: LocaleText.valueFlowGroup,
    accountBlocksGroup: LocaleText.accountBlocksGroup,
    shardsGroup: LocaleText.shardsGroup,
    transactions: LocaleText.transactions,
    inMessages: LocaleText.blockMiddleTableTitle,
    outMessages: LocaleText.blockLastTableTitle,
  };

  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(6);
  /**
   * For skeleton animation
   */
  public skeletonArrayForFilter: Array<number> = new Array(3);
  /**
   * Value Data for view
   */
  public valueViewerData: Array<ViewerData>;
  /**
   * Account Data for view
   */
  public accountViewerData: Array<ViewerData>;
  /**
   * Shards Data for view
   */
  public shardsViewerData: Array<ViewerData>;
  /**
   * Master config Data for view
   */
  public masterConfigViewerData: Array<ViewerData>;

  /**
   * Aditional Data for view
   */
  public outMessTableViewerData: Array<TabViewerData>;

  /**
   * Id for redirect
   */
  public previosBlockId: string;
  /**
   * Id for redirect
   */
  public nextBlockId: string;

  /**
   * Block's transactions
   */
  public transactions: Array<Transaction>;
  /**
   * Block's in_msg_descr
   */
  public inMessages: Array<MsgData>;
  /**
   * Block's out_msg_descr
   */
  public outMessages: Array<MsgData>;

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected service: BlockDetailsService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog,
    private transactionQueries: TransactionQueries,
    private blockQueries: BlockQueries
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

        this._service.getModel(this.modelId)
          .pipe(takeUntil(this._unsubscribe))
          .subscribe((_model: Block[]) => {

            if (!_model[0]) {
              this.router.navigate([`/${this._service.parentPageName}`]);
              this._unsubscribe.next();
              this._unsubscribe.complete();
              return;
            }
  
            this.model = this._service.factoryFunc(_model[0]);

            // Get aditional data
            this.initList();

          }, (error: any) => {
            console.log(error);
          });

      })
      .unsubscribe();
  }

  /**
   * Initialization of the component
   * For list component
   */
  public initList(): void {
    this.route.queryParams
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((queryParams: Params) => {

        this.params = _.clone(this._service.baseFunctionsService.getFilterParams(queryParams, this.params));

        this.detectChanges();

        if (this.initComplete) {
          this.refreshData();
        }

      });

    this.initMethod();
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.valueViewerData = null;
    this.accountViewerData = null;
    this.shardsViewerData = null;
    this.masterConfigViewerData = null;
    this.previosBlockId = null;
    this.nextBlockId = null;
    this.transactions = null;
    this.inMessages = null;
    this.outMessages = null;
  }

  /**
   * Destruction of the component
   */
  public clearData(): void {
    this.unsubscribe();
    this.viewersLoading = true;
    this.disabled = false;
    this.generalViewerData = [];
    this.aditionalViewerData = [];
    this.valueViewerData = [];
    this.accountViewerData = [];
    this.shardsViewerData = [];
    this.masterConfigViewerData = [];
    this.model = null;
    this.modelId =  null;
    this.transactions = [];
    this.inMessages = [];
    this.outMessages = [];

    this.tableViewersLoading = true;
    this.tableViewerData = [];

    this.detectChanges();
  }

  /**
   * Redirect on previos block page
   */
  public onPreviosBlock(): void {
    if (!this.previosBlockId) { return; }
    this.clearData();
    this.router.navigate([`/${appRouteMap.block}/${this.previosBlockId}`])
      .then(() =>{ this.ngOnInit(); });
  }

  /**
   * Redirect on next block page
   */
  public onNextBlock(): void {
    if (!this.nextBlockId) { return; }
    this.clearData();
    this.router.navigate([`/${appRouteMap.block}/${this.nextBlockId}`])
      .then(() =>{ this.ngOnInit(); });           
  }

  /**
   * Export event
   */
  public onPreviosBlockByKey(_seq_no: number): void {
    if (this.disabled || _seq_no == null) { return; }
  
    this.disabled = true;

    // Get previos block
    this.service.getData(
      this.service.getVariablesForBlockBySeqNo(_seq_no, this.model.workchain_id),
      this._service.graphQueryService['getBlocks'],
      appRouteMap.blocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Block[]) => {

        this.router.navigate([`/${appRouteMap.block}/${res[0].id}`]);

      }, (error: any) => {

        this.disabled = false;
        console.log(error);

      });

  }

  /**
   * Export method
   */
  public onExport(): void {
    if (this.selectedTabIndex === 0 ) {
      const dialogRef = this.dialog.open(ExportDialogomponent, this.getCommonDialogOption());
      dialogRef.componentInstance.params = this.params ? _.clone(this.params) : new SimpleDataFilter();
      dialogRef.componentInstance.data = this.transactions ? _.first(this.transactions, 1) : [];
      dialogRef.componentInstance.parentId = this.modelId;
      dialogRef.componentInstance.listName = appRouteMap.transactions;
    }
    else if (this.selectedTabIndex === 1 || this.selectedTabIndex === 2) {
      let csvContent = '';
      csvContent = this.selectedTabIndex === 1 ? IN_MSG_CSV_HEADER : OUT_MSG_CSV_HEADER;

      let dataString = '';

      let _data  = this.selectedTabIndex === 1 ? this.inMessages : this.outMessages;

      _data.forEach((item: MsgData, i: number) => {
        dataString = `${item.msg_type ? item.msg_type : 0},`
        +`"${item.msg_type_name ? item.msg_type_name : 0}",`
        +`"${item.fwd_fee ? parseInt(item.fwd_fee, 16) : 0}",`
        +`"${item.transaction_id}","${item.__typename}"`;

        let msg = '';

        if (this.selectedTabIndex === 1) {
          msg = (item.in_msg ? ',in_msg' : '')
          + (item.in_msg ? ` / "${item.in_msg.msg_id ? parseInt(item.in_msg.msg_id, 16) : 0}"` : '')
          + (item.in_msg ? ` / "${item.in_msg.next_addr ? item.in_msg.next_addr : 0}"` : '')
          + (item.in_msg ? ` / "${item.in_msg.cur_addr ? item.in_msg.cur_addr : 0}"` : '')
          + (item.in_msg ? ` / "${item.in_msg.fwd_fee_remaining ? parseInt(item.in_msg.fwd_fee_remaining, 16) : 0}"` : '')
        }
        else {
          msg = (item.out_msg ? ',out_msg' : '')
          + (item.out_msg ? ` / "${item.out_msg.msg_id ? parseInt(item.out_msg.msg_id, 16) : 0}"` : '')
          + (item.out_msg ? ` / "${item.out_msg.next_addr ? item.out_msg.next_addr : 0}"` : '')
          + (item.out_msg ? ` / "${item.out_msg.cur_addr ? item.out_msg.cur_addr : 0}"` : '')
          + (item.out_msg ? ` / "${item.out_msg.fwd_fee_remaining ? parseInt(item.out_msg.fwd_fee_remaining, 16) : 0}"` : '')
        }

        dataString += msg;
  
        csvContent += i < _data.length ? dataString + '\n' : dataString;
      });
   
      this.onDownloadCsv(this.selectedTabIndex === 1 ? `in-${appRouteMap.messages}` : `out-${appRouteMap.messages}`, csvContent);

    }

  }

  /**
   * Load more data
   * @param index Index of selected tab
   */
  public onLoadMore(index: number): void {
    // TODO
  }

  /**
   * First intit
   */
  protected initMethod(): void {
    this.getData();
  }

  /**
   * Получение данных
   */
  protected refreshData(): void {
    this.getTransactions();
  }

  /**
   * Data for model from other queries
   */
  protected getData(): void {

    this.getTransactions();

    // Get next block
    this.service.getData(
      this.service.getVariablesForBlockBySeqNo((this.model.seq_no + 1), this.model.workchain_id, this.model.shard),
      this.blockQueries.getBlocks,
      appRouteMap.blocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Block[]) => {

        this.nextBlockId = res[0] ? res[0].id : null;
        this.detectChanges();

      }, (error: any) => {
        console.log(error);
      });
  }

  /**
   * Map for viewer
   * @param _model Model
   * @param _data Aditional data
   */
  protected mapDataForViews(_model: Block): void {

    this.generalViewerData = [];
    this.generalViewerData.push(new ViewerData({
      title: LocaleText.id,
      value: _model.id != null ? _model.id : '--'
    }));
    this.generalViewerData.push(new ViewerData({
      title: LocaleText.timeDate,
      value: _model.gen_utime != null ? _model.gen_utime : '--',
      isDate: _model.gen_utime != null
    }));
    this.generalViewerData.push(new ViewerData({
      title: LocaleText.number,
      value: _model.seq_no != null ? _model.seq_no : '--'
    }));
    this.generalViewerData.push(new ViewerData({
      title: LocaleText.workchain,
      value: _model.workchain_id != null ? _model.workchain_id : '--'
    }));
    this.generalViewerData.push(new ViewerData({
      title: LocaleText.shard,
      value: _model.shard != null ? _model.shard : '--'
    }));
    this.generalViewerData.push(new ViewerData({
      title: LocaleText.prevKeyBlockSeqNo,
      value: _model.prev_key_block_seqno != null ? _model.prev_key_block_seqno : '--',
      // link: `/${appRouteMap.block}/${this.previosBlockId}`
    }));

    // Details
    this.aditionalViewerData = [];
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.logicalTime,
      value:  _model.start_lt != null &&_model.end_lt != null
        ? Math.round((Number(_model.start_lt) - Number(_model.end_lt)) /1000)
        : '--',
      isDate: _model.start_lt != null &&_model.end_lt != null
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.feesCollected,
      value: _model.value_flow ? _model.value_flow.fees_collected : '0',
      isNumber: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.parent,
      value: _model.prev_ref != null ? _model.prev_ref.root_hash : '--',
      link: _model.prev_ref.root_hash != null ? `/${appRouteMap.block}/${_model.prev_ref.root_hash}` : null
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.globalId,
      value: _model.global_id
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.wantSplit,
      value: _model.want_split,
      isBoolean: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.afterMerge,
      value: _model.after_merge,
      isBoolean: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.getCatchainSeqNo,
      value: _model.gen_catchain_seqno != null ? _model.gen_catchain_seqno : '--'
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.prevRefRootHash,
      value: _model.prev_ref != null ? _model.prev_ref.root_hash : '--',
      link: _model.prev_ref.root_hash != null ? `/${appRouteMap.block}/${_model.prev_ref.root_hash}` : null
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.version,
      value: _model.version,
      isNumber: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.genValidatorListHashShort,
      value: _model.gen_validator_list_hash_short,
      isNumber: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.beforeSplit,
      value: _model.before_split,
      isBoolean: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.afterSplit,
      value: _model.after_split,
      isBoolean: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.wantMerge,
      value: _model.want_merge,
      isBoolean: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.vertSeqNo,
      value: _model.vert_seq_no,
      isNumber: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.minReqMcSeqNo,
      value: _model.min_ref_mc_seqno,
      isNumber: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.genSoftwareVersion,
      value: _model.gen_software_version,
      isNumber: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.genSoftwareCapabilities,
      value: _model.gen_software_capabilities != null ? _model.gen_software_capabilities : '--'
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.randSeed,
      value: _model.rand_seed != null ? _model.rand_seed : '--'
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.boc,
      value: _model.boc != null ? _model.boc : '--'
    }));

    // Подзаголовок - будет выделен
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.recoverCreateMsg,
      isHeader: true
    }));

    // Details
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.msgType,
      value: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].msg_type_name != null ? _model.in_msg_descr[0].msg_type_name : '--'
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.ihrFee,
      value: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].ihr_fee != null ? _model.in_msg_descr[0].ihr_fee : '--'
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.inMsgMsgId,
      value: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].in_msg && _model.in_msg_descr[0].in_msg.msg_id != null ? _model.in_msg_descr[0].in_msg.msg_id : '--',
      link: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].in_msg && _model.in_msg_descr[0].in_msg.msg_id != null ? `/${appRouteMap.messages}/${_model.in_msg_descr[0].in_msg.msg_id}` : null
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.inMsgNextAddr,
      value: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].in_msg ? _model.in_msg_descr[0].in_msg.next_addr : '0',
      isNumber: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.inMsgCurrAddr,
      value: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].in_msg ? _model.in_msg_descr[0].in_msg.cur_addr : '0',
      isNumber: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.inMsgFwdFeeRemaining,
      value: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].in_msg ? _model.in_msg_descr[0].in_msg.fwd_fee_remaining : '0',
      isNumber: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.fwdFee,
      value: _model.in_msg_descr && _model.in_msg_descr[0] ? _model.in_msg_descr[0].fwd_fee : '0',
      isNumber: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.transitFee,
      value: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].transit_fee != null ? _model.in_msg_descr[0].transit_fee : '0',
      isNumber: true
    }));
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.transactionId,
      value: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].transaction_id != null ? _model.in_msg_descr[0].transaction_id  : '--',
      link: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].transaction_id != null ? `/${appRouteMap.transactions}/${_model.in_msg_descr[0].transaction_id}` : null
    }));

    // // Value
    this.valueViewerData = [];
    this.valueViewerData.push(new ViewerData({
      title: LocaleText.toNextBlock,
      value: _model.value_flow ? _model.value_flow.to_next_blk : '0',
      isNumber: true
    }));
    this.valueViewerData.push(new ViewerData({
      title: LocaleText.exported,
      value: _model.value_flow ? _model.value_flow.exported : '0',
      isNumber: true
    }));
    this.valueViewerData.push(new ViewerData({
      title: LocaleText.feesCollected,
      value: _model.value_flow ? _model.value_flow.fees_collected : '0',
      isNumber: true
    }));
    this.valueViewerData.push(new ViewerData({
      title: LocaleText.created,
      value: _model.value_flow ? _model.value_flow.created : '0',
      isNumber: true
    }));
    this.valueViewerData.push(new ViewerData({
      title: LocaleText.imported,
      value: _model.value_flow ? _model.value_flow.imported : '0',
      isNumber: true
    }));
    this.valueViewerData.push(new ViewerData({
      title: LocaleText.fromPrevBlock,
      value: _model.value_flow ? _model.value_flow.from_prev_blk : '0',
      isNumber: true
    }));
    this.valueViewerData.push(new ViewerData({
      title: LocaleText.minted,
      value: _model.value_flow ? _model.value_flow.minted : '0',
      isNumber: true
    }));
    this.valueViewerData.push(new ViewerData({
      title: LocaleText.feesImported,
      value: _model.value_flow ? _model.value_flow.fees_imported : '0',
      isNumber: true
    }));

    this.accountViewerData = [];
    if (_model.account_blocks && _model.account_blocks.length) {

      _model.account_blocks.forEach((item, i: number) => {
        // Подзаголовок - будет выделен
        this.accountViewerData.push(new ViewerData({
          title: `${LocaleText.accountBlocks} ${i}`,
          isHeader: true
        }));

        this.accountViewerData.push(new ViewerData({
          title: LocaleText.accountAddr,
          value: item.account_addr != null ? item.account_addr : '--'
        }));
        this.accountViewerData.push(new ViewerData({
          title: LocaleText.oldHash,
          value: item.old_hash != null ? item.old_hash : '--'
        }));
        this.accountViewerData.push(new ViewerData({
          title: LocaleText.newHash,
          value: item.new_hash != null ? item.new_hash : '--'
        }));
        this.accountViewerData.push(new ViewerData({
          title: LocaleText.trCount,
          value: item.tr_count,
          isNumber: true
        }));

      });

    }

    this.shardsViewerData = [];

    if (_model.master && _model.master.shard_hashes && _model.master.shard_hashes.length) {

      _model.master.shard_hashes.forEach((item, i: number) => {
        // Подзаголовок - будет выделен
        this.shardsViewerData.push(new ViewerData({
          title: `${LocaleText.shardHash} ${i}`,
          isHeader: true
        }));

        this.shardsViewerData.push(new ViewerData({
          title: `${LocaleText.workchain} + ${LocaleText.shard}`,
          value: `${item.workchain_id}:${item.shard}`
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.seqNo,
          value: item.descr && item.descr.seq_no != null ? item.descr.seq_no : '--'
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.regMcSeqno,
          value: item.descr && item.descr.reg_mc_seqno != null ? item.descr.reg_mc_seqno : '--'
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.startLtEndLt,
          value: item.descr && item.descr.start_lt != null && item.descr.end_lt != null ? Math.round((Number(item.descr.start_lt) - Number(item.descr.end_lt))/1000) : '--',
          isDate: item.descr && item.descr.start_lt != null && item.descr.end_lt != null,
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.rootHash,
          value: item.descr && item.descr.root_hash != null ? item.descr.root_hash : '--'
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.fileHash,
          value: item.descr && item.descr.file_hash != null ? item.descr.file_hash : '--'
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.beforeSplit,
          value: item.descr ? item.descr.before_split : false,
          isBoolean: true
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.beforeMerge,
          value: item.descr ? item.descr.before_merge : false,
          isBoolean: true
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.wantSplit,
          value: item.descr ? item.descr.want_split : false,
          isBoolean: true
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.wantMerge,
          value: item.descr ? item.descr.want_merge : false,
          isBoolean: true
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.nxCcUpdated,
          value: item.descr ? item.descr.nx_cc_updated : false,
          isBoolean: true
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.nextCatchainSeqno,
          value: item.descr ? item.descr.flags : '0',
          isNumber: true
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.nextValidatorShard,
          value: item.descr && item.descr.next_catchain_seqno != null ? item.descr.next_catchain_seqno : '--'
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.minRefMcSeqno,
          value: item.descr && item.descr.next_validator_shard != null ? item.descr.next_validator_shard : '--'
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.genUtime,
          value: item.descr &&  item.descr.gen_utime != null ? item.descr.gen_utime : '--',
          isDate: item.descr &&  item.descr.gen_utime != null
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.feesCollected,
          value: item.descr ? item.descr.nx_cc_updated : false,
          isNumber: true
        }));
        this.shardsViewerData.push(new ViewerData({
          title: LocaleText.fundsCreated,
          value: item.descr ? item.descr.funds_created : false,
          isNumber: true
        }));
      });


      if (_model.master && _model.master.shard_fees && _model.master.shard_fees.length) {

        _model.master.shard_fees.forEach((item, i: number) => {
          // Подзаголовок - будет выделен
          this.shardsViewerData.push(new ViewerData({
            title: `${LocaleText.shardFee} ${i}`,
            isHeader: true
          }));
  
          this.shardsViewerData.push(new ViewerData({
            title: `${LocaleText.workchain} + ${LocaleText.shard}`,
            value: `${item.workchain_id}:${item.shard}`
          }));
          this.shardsViewerData.push(new ViewerData({
            title: LocaleText.fees,
            value: item.fees != null ? item.fees : '--'
          }));
          this.shardsViewerData.push(new ViewerData({
            title: LocaleText.created,
            value: item.create != null ? item.create : '--'
          }));
        });

      }

    }


    // // // Action
    // this.actionViewerData = [];
    // this.actionViewerData.push(new GeneralViewer({title: 'Success', value: _model.action && _model.action.success ? 'Yes' : 'No'}));
    // this.actionViewerData.push(new GeneralViewer({title: 'Valid', value: _model.action && _model.action.valid ? 'Yes' : 'No'}));
    // this.actionViewerData.push(new GeneralViewer({title: 'No funds', value: _model.action && _model.action.no_funds ? 'Yes' : 'No'}));
    // this.actionViewerData.push(new GeneralViewer({title: 'Status change', value: _model.action && _model.action.total_fwd_fees ? _model.action.total_fwd_fees : ''}));
    // this.actionViewerData.push(new GeneralViewer({title: 'Total fwd fees', value: _model.action && _model.action.total_fwd_fees ? _model.action.total_fwd_fees : ''}));
    // this.actionViewerData.push(new GeneralViewer({title: 'Total action fees', value: _model.action ? _model.action.total_action_fees : ''}));
    // this.actionViewerData.push(new GeneralViewer({title: 'Result code', value: _model.action ? _model.action.result_code : ''}));
    // this.actionViewerData.push(new GeneralViewer({title: 'Tot actions', value: _model.action ? _model.action.tot_actions : ''}));
    // this.actionViewerData.push(new GeneralViewer({title: 'Spec actions', value: _model.action ? _model.action.spec_actions : ''}));
    // this.actionViewerData.push(new GeneralViewer({title: 'Skipped actions', value: _model.action ? _model.action.skipped_actions : ''}));
    // this.actionViewerData.push(new GeneralViewer({title: 'Messages created', value: _model.action ? _model.action.msgs_created : ''}));
    // this.actionViewerData.push(new GeneralViewer({title: 'Action list hash', value: _model.action ? _model.action.action_list_hash : ''}));

    // this.finalStateViewerData = [];
    // this.finalStateViewerData.push(new GeneralViewer({title: 'Destroyed', value: _model.destroyed ? 'Yes' : 'No'}));
  }

  /**
   * Get transactions
   */
  private getTransactions(): void {

    this.tableViewersLoading = true;
    this.detectChanges();

    // Get transactions
    this.service.getData(
      this.service.getVariablesForTransactions(this.params, String(this.modelId)),
      this.transactionQueries.getTransactions,
      appRouteMap.transactions
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((res: Transaction[]) => {

        this.transactions = res ? res : [];
        this.inMessages = this.model.in_msg_descr ? this.model.in_msg_descr : [];
        this.outMessages = this.model.out_msg_descr ? this.model.out_msg_descr : [];

        this.previosBlockId = this.model.prev_ref && this.model.prev_ref.root_hash
          ? this.model.prev_ref.root_hash
          : null;

        this.mapDataForViews(this.model);
        this.viewersLoading = false;
        this.detectChanges();

        this.tableViewerData = this._service.mapDataForTable(this.transactions, appRouteMap.transactions, 10);

        this.aditionalTableViewerData = this._service.mapDataForTable(this.inMessages, appRouteMap.inOutMessages, 10);

        this.outMessTableViewerData = this._service.mapDataForTable(this.outMessages, appRouteMap.inOutMessages, 10);

        this.tableViewersLoading = false;
        this.filterLoading = false;
        this.initComplete = true;
        this.detectChanges();

    }, (error: any) => {
      console.log(error);
    });
  }
}
