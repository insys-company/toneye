import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Transaction, Block, GeneralViewer } from '../../api';
import { TransactionDetailsService } from './transaction-details.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import _ from 'underscore';
import { appRouteMap } from 'src/app/app-route-map';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailsComponent implements OnInit, OnDestroy {
  /**
   * Для отписок на запросы
   */
  public unsubscribe: Subject<void> = new Subject();
  /**
   * For skeleton animation
   */
  public skeletonArray: Array<number> = new Array(4);
  /**
   * Flag for show/hide state of info
   */
  public isAditionalInfoOpen: boolean;
  /**
   * Flag for loading animation in Viewers
   */
  public viewersLoading: boolean;
  /**
   * Model
   */
  public data: Transaction;
  /**
   * ModelId
   */
  public modelId: string | number;
  /**
   * General Data for view
   */
  public generalViewerData: Array<GeneralViewer>;
  /**
   * Aditional Data for view
   */
  public aditionalViewerData: Array<GeneralViewer>;
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
    private changeDetection: ChangeDetectorRef,
    private service: TransactionDetailsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

    /** Loading animation in children */
    this.viewersLoading = true;
  }

  /**
   * Initialization of the component
   */
  ngOnInit(): void {
    this.detectChanges();

    this.route.params
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((params: Params) => {
        this.modelId = params['id'] != null ? params['id'].trim() : null;

        if (this.modelId == null) {
          this.router.navigate([`/${appRouteMap.transactions}`]);
          this.unsubscribe.next();
          this.unsubscribe.complete();
          return;
        }

        this.service.getTransaction(this.modelId)
          .pipe(takeUntil(this.unsubscribe))
          .subscribe((model: Transaction[]) => {
  
            this.data = model[0]
              ? new Transaction(model[0])
              : new Transaction();

            this.init();

          }, (error: any) => {
            console.log(error);
          });

      })
      .unsubscribe();
  }

  /**
   * Destruction of the component
   */
  ngOnDestroy(): void {
    // TODO
  }

  /**
   * Export event
   */
  onExport(): void {
    // TODO
  }

  /**
   * Init method
   */
  private init(): void {

    this.service.getBlock(this.data.block_id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((blockModel: Block[]) => {

        blockModel[0] = blockModel[0]
          ? new Block(blockModel[0])
          : new Block();

        this.generalViewerData = this.mapData(this.data, blockModel[0]);
        this.viewersLoading = false;
        this.detectChanges();

    }, (error: any) => {
      console.log(error);
    });

  }

  /**
   * Map transaction for viewer
   * @param _model Model of transaction
   */
  private mapData(_model: Transaction, _data: Block): GeneralViewer[] {

    let viewers = [];

    viewers.push(new GeneralViewer({title: 'ID', value: _model.id}));
    viewers.push(new GeneralViewer({title: 'Type', value: _model.tr_type == 3 ? 'Tock' : _model.tr_type == 2 ? 'Tick' : _model.balance_delta}));
    viewers.push(new GeneralViewer({title: 'Time & Date', value: _model.now}));
    viewers.push(new GeneralViewer({title: 'Account', value: _model.account_addr}));

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

    return viewers;
  }

  /**
   * Detect Changes
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
