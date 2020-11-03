import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from 'src/app/shared/components/app-base/app-base.component';
import { TransactionDetailsService } from './transaction-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockQueries } from 'src/app/api/queries';
import { Transaction, ViewerData, Block } from 'src/app/api';
import { takeUntil } from 'rxjs/operators';
import { appRouteMap } from 'src/app/app-route-map';
import { LocaleText } from 'src/locale/locale';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailsComponent extends BaseComponent<Transaction> implements OnInit, OnDestroy {

  /** Общие тексты для страниц */
  public locale = {
    title: LocaleText.transactionPage,
    moreDetails: LocaleText.moreDetails,
  };

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
    protected dialog: MatDialog,
    protected blockQueries: BlockQueries,
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
    this.generalViewerData.push(new ViewerData({title: LocaleText.id, value: _model.id}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.type, value: _model.tr_type == 3 ? LocaleText.tock : _model.tr_type == 2 ? LocaleText.tick : _model.balance_delta}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.timeDate, value: _model.now != null ? _model.now : '--', isDate: _model.now != null}));
    this.generalViewerData.push(new ViewerData({title: LocaleText.account, value: _model.account_addr}));

    // Details
    this.aditionalViewerData = [];
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.block, value: `${_data.seq_no} / ${_data.workchain_id}:${_data.shard}`}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.blockID, value: _data.id}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.logicalTime, value: _data.gen_utime != null ? _data.gen_utime : '--', isDate: _data.gen_utime != null}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.prevTransactionHash, value: _model.prev_trans_hash, isBoolean: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.prevTransactionLt, value: _model.lt != null ? parseInt(_model.lt) : '0'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.outMessagesCount, value: _model.outmsg_cnt, isNumber: true}));
    // Details
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.originalStatus, value: _model.orig_status}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.endStatus, value: _model.end_status}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.oldHash, value: _model.old_hash != null ? _model.old_hash : '--'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.newHash, value: _model.new_hash != null ? _model.new_hash : '--'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.aborted, value: _model.aborted, isBoolean: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.boc, value: _model.boc != null ? _model.boc : '--'}));

    // Подзаголовок - будет выделен
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.storage,
      isHeader: true
    }));

    this.aditionalViewerData.push(new ViewerData({title: LocaleText.storageFeesCollected, value: _model.storage ? _model.storage.storage_fees_collected : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.storageFeesDue, value: _model.storage ? _model.storage.storage_fees_due : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.statusChange, value: _model.storage ? !_model.storage.status_change ? 'Unchanged' : '??' : ''}));

    // Подзаголовок - будет выделен
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.compute,
      isHeader: true
    }));

    this.aditionalViewerData.push(new ViewerData({title: LocaleText.gaasLimit, value: _model.compute && _model.compute.gas_limit != null ? parseInt(_model.compute.gas_limit, 16) : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.gaasUsed, value: _model.compute && _model.compute.gas_used != null ? parseInt(_model.compute.gas_used, 16) : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.gaasFees, value: _model.compute && _model.compute.gas_fees != null ? parseInt(_model.compute.gas_fees, 16) : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.gasCredit, value: _model.compute && _model.compute.gas_credit != null ? parseInt(_model.compute.gas_credit, 16) : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.computeType, value: _model.compute ? _model.compute.compute_type == 1 ? 'VM' : '??' : ''}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.success, value: _model.compute && _model.compute.success, isBoolean: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.messageStateUsed, value: _model.compute && _model.compute.msg_state_used, isBoolean: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.accountActivated, value: _model.compute && _model.compute.account_activated, isBoolean: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.mode, value: _model.compute ? _model.compute.mode : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.exitCode, value: _model.compute ? _model.compute.exit_code : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.vMSteps, value: _model.compute ? _model.compute.vm_steps : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.vMInitStateHash, value: _model.compute && _model.compute.vm_init_state_hash != null ? _model.compute.vm_init_state_hash : ''}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.vMFinalStateHash, value: _model.compute && _model.compute.vm_final_state_hash != null ? _model.compute.vm_final_state_hash : ''}));

    // Подзаголовок - будет выделен
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.action,
      isHeader: true
    }));

    this.aditionalViewerData.push(new ViewerData({title: LocaleText.success, value: _model.action && _model.action.success, isBoolean: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.valid, value: _model.action && _model.action.valid, isBoolean: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.noFunds, value: _model.action && _model.action.no_funds, isBoolean: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.statusChange, value: _model.action && _model.action.total_fwd_fees != null ? _model.action.total_fwd_fees : '--'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.totalFwdFees, value: _model.action && _model.action.total_fwd_fees != null ? _model.action.total_fwd_fees : '--'}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.totalActionFees, value: _model.action && _model.action.total_action_fees != null ? _model.action.total_action_fees : ''}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.resultCode, value: _model.action ? _model.action.result_code : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.totActions, value: _model.action ? _model.action.tot_actions : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.specActions, value: _model.action ? _model.action.spec_actions : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.skippedActions, value: _model.action ? _model.action.skipped_actions : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.messagesCreated, value: _model.action ? _model.action.msgs_created : '0', isNumber: true}));
    this.aditionalViewerData.push(new ViewerData({title: LocaleText.actionListHash, value: _model.action && _model.action.action_list_hash != null ? _model.action.action_list_hash : ''}));

    // Подзаголовок - будет выделен
    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.finalState,
      isHeader: true
    }));

    this.aditionalViewerData.push(new ViewerData({
      title: LocaleText.destroyed,
      value: _model.destroyed,
      isBoolean: true
    }));
  }
}
