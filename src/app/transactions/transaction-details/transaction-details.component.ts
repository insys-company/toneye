import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { TransactionDetailsService } from './transaction-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockQueries } from 'src/app/api/queries';
import { Transaction, ViewerData, Block } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailsComponent extends BaseComponent<Transaction> implements OnInit, OnDestroy {
  /**
   * Storage Data for view
   */
  public storageViewerData: Array<ViewerData>;
  /**
   * Compute Data for view
   */
  public computeViewerData: Array<ViewerData>;
  /**
   * Action Data for view
   */
  public actionViewerData: Array<ViewerData>;
  /**
   * Final State Data for view
   */
  public finalStateViewerData: Array<ViewerData>;

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected service: TransactionDetailsService,
    protected route: ActivatedRoute,
    protected router: Router,
    protected blockQueries: BlockQueries,
  ) {
    super(
      changeDetection,
      service,
      route,
      router,
    );
  }

  /**
   * Destruction of the component
   */
  public ngOnDestroy(): void {
    super.ngOnDestroy();
    this.storageViewerData = null;
    this.computeViewerData = null;
    this.actionViewerData = null;
    this.finalStateViewerData = null;
  }

  /**
   * Export event
   */
  public onExport(): void {
    // TODO
  }

  /**
   * Data for model from other queries
   */
  protected getData(): void {
    /** Get blocks */
    this.service.getData(
      this._service.getVariablesForModel(this.model.block_id),
      this.blockQueries.getBlocks,
      appRouteMap.blocks
    )
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((blockModel: Block[]) => {

        blockModel[0] = blockModel[0]
          ? new Block(blockModel[0])
          : new Block();

        this.mapDataForViews(this.model, blockModel[0]);
        this.viewersLoading = false;
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
  protected mapDataForViews(_model: Transaction, _data: Block): void {

    this.generalViewerData = [];
    this.generalViewerData.push(new ViewerData({title: 'ID', value: _model.id}));
    this.generalViewerData.push(new ViewerData({title: 'Type', value: _model.tr_type == 3 ? 'Tock' : _model.tr_type == 2 ? 'Tick' : _model.balance_delta}));
    this.generalViewerData.push(new ViewerData({title: 'Time & Date', value: _model.now}));
    this.generalViewerData.push(new ViewerData({title: 'Account', value: _model.account_addr}));

    // Details
    this.aditionalViewerData = [];
    this.aditionalViewerData.push(new ViewerData({title: 'Block', value: `${_data.seq_no} / ${_data.workchain_id} : ${_data.shard}`}));
    this.aditionalViewerData.push(new ViewerData({title: 'Block ID', value: _data.id}));
    this.aditionalViewerData.push(new ViewerData({title: 'Logical time', value: _data.gen_utime}));
    this.aditionalViewerData.push(new ViewerData({title: 'Prev. transaction hash', value: _model.prev_trans_hash ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new ViewerData({title: 'Prev. transaction lt', value: _model.lt}));
    this.aditionalViewerData.push(new ViewerData({title: 'Out messages count', value: _model.outmsg_cnt}));
    // Details
    this.aditionalViewerData.push(new ViewerData({title: 'Original status', value: _model.orig_status}));
    this.aditionalViewerData.push(new ViewerData({title: 'End status', value: _model.end_status}));
    this.aditionalViewerData.push(new ViewerData({title: 'Old hash', value: _model.old_hash}));
    this.aditionalViewerData.push(new ViewerData({title: 'New hash', value: _model.new_hash}));
    this.aditionalViewerData.push(new ViewerData({title: 'Aborted', value: _model.aborted ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new ViewerData({title: 'Boc', value: _model.boc}));

    // Storage
    this.storageViewerData = [];
    this.storageViewerData.push(new ViewerData({title: 'Storage fees collected', value: _model.storage ? _model.storage.storage_fees_collected : ''}));
    this.storageViewerData.push(new ViewerData({title: 'Storage fees due', value: _model.storage ? _model.storage.storage_fees_due : ''}));
    this.storageViewerData.push(new ViewerData({title: 'Status change', value: _model.storage ? !_model.storage.status_change ? 'Unchanged' : '??' : ''}));

    // Compute
    this.computeViewerData = [];
    this.computeViewerData.push(new ViewerData({title: 'Gas Limit', value: _model.compute ? _model.compute.gas_limit : ''}));
    this.computeViewerData.push(new ViewerData({title: 'Gas Used', value: _model.compute ? _model.compute.gas_used : ''}));
    this.computeViewerData.push(new ViewerData({title: 'Gas fees', value: _model.compute ? _model.compute.gas_fees : ''}));
    this.computeViewerData.push(new ViewerData({title: 'Gas credit', value: _model.compute ? _model.compute.gas_credit : ''}));
    this.computeViewerData.push(new ViewerData({title: 'Compute type', value: _model.compute ? _model.compute.compute_type == 1 ? 'VM' : '??' : ''}));
    this.computeViewerData.push(new ViewerData({title: 'Success', value: _model.compute && _model.compute.success ? 'Yes' : 'No'}));
    this.computeViewerData.push(new ViewerData({title: 'Message state used', value: _model.compute && _model.compute.msg_state_used ? 'Yes' : 'No'}));
    this.computeViewerData.push(new ViewerData({title: 'Account activated', value: _model.compute && _model.compute.account_activated ? 'Yes' : 'No'}));
    this.computeViewerData.push(new ViewerData({title: 'Mode', value: _model.compute ? _model.compute.mode : ''}));
    this.computeViewerData.push(new ViewerData({title: 'Exit code', value: _model.compute ? _model.compute.exit_code : ''}));
    this.computeViewerData.push(new ViewerData({title: 'VM steps', value: _model.compute ? _model.compute.vm_steps : ''}));
    this.computeViewerData.push(new ViewerData({title: 'VM init state hash', value: _model.compute ? _model.compute.vm_init_state_hash : ''}));
    this.computeViewerData.push(new ViewerData({title: 'VM final state hash', value: _model.compute ? _model.compute.vm_final_state_hash : ''}));

    // // Action
    this.actionViewerData = [];
    this.actionViewerData.push(new ViewerData({title: 'Success', value: _model.action && _model.action.success ? 'Yes' : 'No'}));
    this.actionViewerData.push(new ViewerData({title: 'Valid', value: _model.action && _model.action.valid ? 'Yes' : 'No'}));
    this.actionViewerData.push(new ViewerData({title: 'No funds', value: _model.action && _model.action.no_funds ? 'Yes' : 'No'}));
    this.actionViewerData.push(new ViewerData({title: 'Status change', value: _model.action && _model.action.total_fwd_fees ? _model.action.total_fwd_fees : ''}));
    this.actionViewerData.push(new ViewerData({title: 'Total fwd fees', value: _model.action && _model.action.total_fwd_fees ? _model.action.total_fwd_fees : ''}));
    this.actionViewerData.push(new ViewerData({title: 'Total action fees', value: _model.action ? _model.action.total_action_fees : ''}));
    this.actionViewerData.push(new ViewerData({title: 'Result code', value: _model.action ? _model.action.result_code : ''}));
    this.actionViewerData.push(new ViewerData({title: 'Tot actions', value: _model.action ? _model.action.tot_actions : ''}));
    this.actionViewerData.push(new ViewerData({title: 'Spec actions', value: _model.action ? _model.action.spec_actions : ''}));
    this.actionViewerData.push(new ViewerData({title: 'Skipped actions', value: _model.action ? _model.action.skipped_actions : ''}));
    this.actionViewerData.push(new ViewerData({title: 'Messages created', value: _model.action ? _model.action.msgs_created : ''}));
    this.actionViewerData.push(new ViewerData({title: 'Action list hash', value: _model.action ? _model.action.action_list_hash : ''}));

    this.finalStateViewerData = [];
    this.finalStateViewerData.push(new ViewerData({title: 'Destroyed', value: _model.destroyed ? 'Yes' : 'No'}));
  }
}
