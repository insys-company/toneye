import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Transaction, Block, GeneralViewer } from '../../api';
import { TransactionDetailsService } from './transaction-details.service';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { AppDetailsComponent } from 'src/app/shared/components/app-details/app-details.component';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailsComponent extends AppDetailsComponent<Transaction> implements OnInit, OnDestroy {
  /**
   * Storage Data for view
   */
  public storageViewerData: Array<GeneralViewer>;
  /**
   * Compute Data for view
   */
  public computeViewerData: Array<GeneralViewer>;
  /**
   * Action Data for view
   */
  public actionViewerData: Array<GeneralViewer>;
  /**
   * Final State Data for view
   */
  public finalStateViewerData: Array<GeneralViewer>;

  constructor(
    protected changeDetection: ChangeDetectorRef,
    protected service: TransactionDetailsService,
    protected route: ActivatedRoute,
    protected router: Router,
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
  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.storageViewerData = null;
    this.computeViewerData = null;
    this.actionViewerData = null;
    this.finalStateViewerData = null;
  }

  /**
   * Export event
   */
  onExport(): void {
    // TODO
  }

  /**
   * Data for model from other queries
   */
  protected getData(): void {

    this.service.getBlock(this.model.block_id)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((blockModel: Block[]) => {

        blockModel[0] = blockModel[0]
          ? new Block(blockModel[0])
          : new Block();

        this.mapData(this.model, blockModel[0]);
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
  protected mapData(_model: Transaction, _data: Block): void {

    this.generalViewerData = [];
    this.generalViewerData.push(new GeneralViewer({title: 'ID', value: _model.id}));
    this.generalViewerData.push(new GeneralViewer({title: 'Type', value: _model.tr_type == 3 ? 'Tock' : _model.tr_type == 2 ? 'Tick' : _model.balance_delta}));
    this.generalViewerData.push(new GeneralViewer({title: 'Time & Date', value: _model.now}));
    this.generalViewerData.push(new GeneralViewer({title: 'Account', value: _model.account_addr}));

    // Details
    this.aditionalViewerData = [];
    this.aditionalViewerData.push(new GeneralViewer({title: 'Block', value: `${_data.seq_no} / ${_data.workchain_id} : ${_data.shard}`}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Block ID', value: _data.id}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Logical time', value: _data.gen_utime}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Prev. transaction hash', value: _model.prev_trans_hash ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Prev. transaction lt', value: _model.lt}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Out messages count', value: _model.outmsg_cnt}));
    // Details
    this.aditionalViewerData.push(new GeneralViewer({title: 'Original status', value: _model.orig_status}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'End status', value: _model.end_status}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Old hash', value: _model.old_hash}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'New hash', value: _model.new_hash}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Aborted', value: _model.aborted ? 'Yes' : 'No'}));
    this.aditionalViewerData.push(new GeneralViewer({title: 'Boc', value: _model.boc}));

    // Storage
    this.storageViewerData = [];
    this.storageViewerData.push(new GeneralViewer({title: 'Storage fees collected', value: _model.storage ? _model.storage.storage_fees_collected : ''}));
    this.storageViewerData.push(new GeneralViewer({title: 'Storage fees due', value: _model.storage ? _model.storage.storage_fees_due : ''}));
    this.storageViewerData.push(new GeneralViewer({title: 'Status change', value: _model.storage ? !_model.storage.status_change ? 'Unchanged' : '??' : ''}));

    // Compute
    this.computeViewerData = [];
    this.computeViewerData.push(new GeneralViewer({title: 'Gas Limit', value: _model.compute ? _model.compute.gas_limit : ''}));
    this.computeViewerData.push(new GeneralViewer({title: 'Gas Used', value: _model.compute ? _model.compute.gas_used : ''}));
    this.computeViewerData.push(new GeneralViewer({title: 'Gas fees', value: _model.compute ? _model.compute.gas_fees : ''}));
    this.computeViewerData.push(new GeneralViewer({title: 'Gas credit', value: _model.compute ? _model.compute.gas_credit : ''}));
    this.computeViewerData.push(new GeneralViewer({title: 'Compute type', value: _model.compute ? _model.compute.compute_type == 1 ? 'VM' : '??' : ''}));
    this.computeViewerData.push(new GeneralViewer({title: 'Success', value: _model.compute && _model.compute.success ? 'Yes' : 'No'}));
    this.computeViewerData.push(new GeneralViewer({title: 'Message state used', value: _model.compute && _model.compute.msg_state_used ? 'Yes' : 'No'}));
    this.computeViewerData.push(new GeneralViewer({title: 'Account activated', value: _model.compute && _model.compute.account_activated ? 'Yes' : 'No'}));
    this.computeViewerData.push(new GeneralViewer({title: 'Mode', value: _model.compute ? _model.compute.mode : ''}));
    this.computeViewerData.push(new GeneralViewer({title: 'Exit code', value: _model.compute ? _model.compute.exit_code : ''}));
    this.computeViewerData.push(new GeneralViewer({title: 'VM steps', value: _model.compute ? _model.compute.vm_steps : ''}));
    this.computeViewerData.push(new GeneralViewer({title: 'VM init state hash', value: _model.compute ? _model.compute.vm_init_state_hash : ''}));
    this.computeViewerData.push(new GeneralViewer({title: 'VM final state hash', value: _model.compute ? _model.compute.vm_final_state_hash : ''}));

    // // Action
    this.actionViewerData = [];
    this.actionViewerData.push(new GeneralViewer({title: 'Success', value: _model.action && _model.action.success ? 'Yes' : 'No'}));
    this.actionViewerData.push(new GeneralViewer({title: 'Valid', value: _model.action && _model.action.valid ? 'Yes' : 'No'}));
    this.actionViewerData.push(new GeneralViewer({title: 'No funds', value: _model.action && _model.action.no_funds ? 'Yes' : 'No'}));
    this.actionViewerData.push(new GeneralViewer({title: 'Status change', value: _model.action && _model.action.total_fwd_fees ? _model.action.total_fwd_fees : ''}));
    this.actionViewerData.push(new GeneralViewer({title: 'Total fwd fees', value: _model.action && _model.action.total_fwd_fees ? _model.action.total_fwd_fees : ''}));
    this.actionViewerData.push(new GeneralViewer({title: 'Total action fees', value: _model.action ? _model.action.total_action_fees : ''}));
    this.actionViewerData.push(new GeneralViewer({title: 'Result code', value: _model.action ? _model.action.result_code : ''}));
    this.actionViewerData.push(new GeneralViewer({title: 'Tot actions', value: _model.action ? _model.action.tot_actions : ''}));
    this.actionViewerData.push(new GeneralViewer({title: 'Spec actions', value: _model.action ? _model.action.spec_actions : ''}));
    this.actionViewerData.push(new GeneralViewer({title: 'Skipped actions', value: _model.action ? _model.action.skipped_actions : ''}));
    this.actionViewerData.push(new GeneralViewer({title: 'Messages created', value: _model.action ? _model.action.msgs_created : ''}));
    this.actionViewerData.push(new GeneralViewer({title: 'Action list hash', value: _model.action ? _model.action.action_list_hash : ''}));

    this.finalStateViewerData = [];
    this.finalStateViewerData.push(new GeneralViewer({title: 'Destroyed', value: _model.destroyed ? 'Yes' : 'No'}));
  }
}
