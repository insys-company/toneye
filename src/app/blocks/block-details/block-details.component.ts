import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { BlockDetailsService } from './block-details.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { TransactionQueries, BlockQueries } from 'src/app/api/queries';
import { Block, ViewerData, Transaction, MsgData, TabViewerData } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import _ from 'underscore';

@Component({
  selector: 'app-block-details',
  templateUrl: './block-details.component.html',
  styleUrls: ['./block-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockDetailsComponent extends BaseComponent<Block> implements OnInit, OnDestroy {
  /**
   * For skeleton animation
   */
  public skeletonArrayForGeneralViewer: Array<number> = new Array(6);
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
    private transactionQueries: TransactionQueries,
    private blockQueries: BlockQueries
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
    this.generalViewerData.push(new ViewerData({title: 'ID', value: _model.id}));
    this.generalViewerData.push(new ViewerData({title: 'Time & Date', value: _model.gen_utime}));
    this.generalViewerData.push(new ViewerData({title: 'Number', value: _model.seq_no}));
    this.generalViewerData.push(new ViewerData({title: 'Workchain', value: _model.workchain_id}));
    this.generalViewerData.push(new ViewerData({title: 'Shard', value: _model.shard}));
    this.generalViewerData.push(new ViewerData({title: 'Prev key block seq no', value: _model.prev_key_block_seqno}));

    // Details
    this.aditionalViewerData = [];
    this.aditionalViewerData.push(new ViewerData({title: 'Logical time', value: `${_model.start_lt} - ${_model.end_lt}`}));
    this.aditionalViewerData.push(new ViewerData({title: 'Fees collected', value: _model.value_flow ? _model.value_flow.fees_collected : ''}));
    this.aditionalViewerData.push(new ViewerData({title: 'Parent', value: _model.prev_ref ? _model.prev_ref.root_hash : ''}));
    this.aditionalViewerData.push(new ViewerData({title: 'Global Id', value: _model.global_id}));
    this.aditionalViewerData.push(new ViewerData({title: 'Want split', value: _model.want_split ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new ViewerData({title: 'After merge', value: _model.after_merge ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new ViewerData({title: 'Get catchain seq no', value: _model.gen_catchain_seqno}));
    this.aditionalViewerData.push(new ViewerData({title: 'Prev ref root hash', value: _model.prev_ref ? _model.prev_ref.root_hash : ''}));
    this.aditionalViewerData.push(new ViewerData({title: 'Version', value: _model.version}));
    this.aditionalViewerData.push(new ViewerData({title: 'Gen validator list hash short', value: _model.gen_validator_list_hash_short}));
    this.aditionalViewerData.push(new ViewerData({title: 'Before split', value: _model.before_split ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new ViewerData({title: 'After split', value: _model.after_split ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new ViewerData({title: 'Want merge', value: _model.want_merge ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new ViewerData({title: 'Vert seq no', value: _model.vert_seq_no}));
    this.aditionalViewerData.push(new ViewerData({title: 'Min req mc seq no', value: _model.min_ref_mc_seqno}));
    this.aditionalViewerData.push(new ViewerData({title: 'Gen software version', value: _model.gen_software_version}));
    this.aditionalViewerData.push(new ViewerData({title: 'Gen software capabilities', value: _model.gen_software_capabilities}));
    this.aditionalViewerData.push(new ViewerData({title: 'Rand seed', value: _model.rand_seed}));
    this.aditionalViewerData.push(new ViewerData({title: 'Boc', value: _model.boc}));
    // Details
    this.aditionalViewerData.push(new ViewerData({title: 'Msg type', value: _model.in_msg_descr && _model.in_msg_descr[0] ? _model.in_msg_descr[0].msg_type_name : '???' }));
    this.aditionalViewerData.push(new ViewerData({title: 'Ihr fee', value: _model.in_msg_descr && _model.in_msg_descr[0] ? _model.in_msg_descr[0].ihr_fee : '???'}));
    this.aditionalViewerData.push(new ViewerData({title: 'In msg / Msg Id', value: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].in_msg ? _model.in_msg_descr[0].in_msg.msg_id : '???'}));
    this.aditionalViewerData.push(new ViewerData({title: 'In msg / Next addr', value: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].in_msg ? _model.in_msg_descr[0].in_msg.next_addr : '???'}));
    this.aditionalViewerData.push(new ViewerData({title: 'In msg / Curr addr', value: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].in_msg ? _model.in_msg_descr[0].in_msg.cur_addr : '???'}));
    this.aditionalViewerData.push(new ViewerData({title: 'In msg / Fwd fee remaining', value: _model.in_msg_descr && _model.in_msg_descr[0] && _model.in_msg_descr[0].in_msg ? _model.in_msg_descr[0].in_msg.fwd_fee_remaining : '???'}));
    this.aditionalViewerData.push(new ViewerData({title: 'Fwd fee', value: _model.in_msg_descr && _model.in_msg_descr[0] ? _model.in_msg_descr[0].fwd_fee : '???'}));
    this.aditionalViewerData.push(new ViewerData({title: 'Transit fee', value: _model.in_msg_descr && _model.in_msg_descr[0] ? _model.in_msg_descr[0].transit_fee : '???'}));
    this.aditionalViewerData.push(new ViewerData({title: 'Transaction id', value: _model.in_msg_descr && _model.in_msg_descr[0] ? _model.in_msg_descr[0].transaction_id : '???'}));

    // // Value
    this.valueViewerData = [];
    this.valueViewerData.push(new ViewerData({title: 'To next block', value: _model.value_flow ? _model.value_flow.to_next_blk : ''}));
    this.valueViewerData.push(new ViewerData({title: 'Exported', value: _model.value_flow ? _model.value_flow.exported : ''}));
    this.valueViewerData.push(new ViewerData({title: 'Fees collected', value: _model.value_flow ? _model.value_flow.fees_collected : ''}));
    this.valueViewerData.push(new ViewerData({title: 'Created', value: _model.value_flow ? _model.value_flow.created : ''}));
    this.valueViewerData.push(new ViewerData({title: 'Imported', value: _model.value_flow ? _model.value_flow.imported : ''}));
    this.valueViewerData.push(new ViewerData({title: 'From prev block', value: _model.value_flow ? _model.value_flow.from_prev_blk : ''}));
    this.valueViewerData.push(new ViewerData({title: 'Minted', value: _model.value_flow ? _model.value_flow.minted : ''}));
    this.valueViewerData.push(new ViewerData({title: 'Fees imported', value: _model.value_flow ? _model.value_flow.fees_imported : ''}));

    // // Compute
    // this.computeViewerData = [];
    // this.computeViewerData.push(new GeneralViewer({title: 'Gas Limit', value: _model.compute ? _model.compute.gas_limit : ''}));
    // this.computeViewerData.push(new GeneralViewer({title: 'Gas Used', value: _model.compute ? _model.compute.gas_used : ''}));
    // this.computeViewerData.push(new GeneralViewer({title: 'Gas fees', value: _model.compute ? _model.compute.gas_fees : ''}));
    // this.computeViewerData.push(new GeneralViewer({title: 'Gas credit', value: _model.compute ? _model.compute.gas_credit : ''}));
    // this.computeViewerData.push(new GeneralViewer({title: 'Compute type', value: _model.compute ? _model.compute.compute_type == 1 ? 'VM' : '??' : ''}));
    // this.computeViewerData.push(new GeneralViewer({title: 'Success', value: _model.compute && _model.compute.success ? 'Yes' : 'No'}));
    // this.computeViewerData.push(new GeneralViewer({title: 'Message state used', value: _model.compute && _model.compute.msg_state_used ? 'Yes' : 'No'}));
    // this.computeViewerData.push(new GeneralViewer({title: 'Account activated', value: _model.compute && _model.compute.account_activated ? 'Yes' : 'No'}));
    // this.computeViewerData.push(new GeneralViewer({title: 'Mode', value: _model.compute ? _model.compute.mode : ''}));
    // this.computeViewerData.push(new GeneralViewer({title: 'Exit code', value: _model.compute ? _model.compute.exit_code : ''}));
    // this.computeViewerData.push(new GeneralViewer({title: 'VM steps', value: _model.compute ? _model.compute.vm_steps : ''}));
    // this.computeViewerData.push(new GeneralViewer({title: 'VM init state hash', value: _model.compute ? _model.compute.vm_init_state_hash : ''}));
    // this.computeViewerData.push(new GeneralViewer({title: 'VM final state hash', value: _model.compute ? _model.compute.vm_final_state_hash : ''}));

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

        this.tableViewerData = this._service.mapDataForTable(this.transactions, appRouteMap.transactions);

        this.aditionalTableViewerData = this._service.mapDataForTable(this.inMessages, appRouteMap.inOutMessages);

        this.outMessTableViewerData = this._service.mapDataForTable(this.outMessages, appRouteMap.inOutMessages);

        this.tableViewersLoading = false;
        this.filterLoading = false;
        this.initComplete = true;
        this.detectChanges();

    }, (error: any) => {
      console.log(error);
    });
  }
}
