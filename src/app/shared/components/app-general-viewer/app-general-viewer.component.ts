import { Component, OnChanges, OnDestroy, Input, ChangeDetectorRef, SimpleChange, ChangeDetectionStrategy } from '@angular/core';
import { ViewerData } from 'src/app/api';
import { smoothDisplayAfterSkeletonAnimation } from 'src/app/app-animations';
import { LocaleText } from 'src/locale/locale';

/**
 * This component displays general information on list pages.
 */
@Component({
  selector: 'app-general-viewer',
  templateUrl: './app-general-viewer.component.html',
  styleUrls: ['./app-general-viewer.component.scss'],
  animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppGeneralViewerComponent implements OnChanges, OnDestroy {
  /**
   * Data for view
   */
  @Input() public data: Array<ViewerData>;
  /**
   * For skeleton animation
   */
  @Input() public skeletonArray: Array<number> = new Array(3);
  /**
   * Flag for loading data
   */
  @Input() public skeletalAnimation: boolean = true;
  /**
   * Header for block
   */
  @Input() public header: string = LocaleText.general;
  /**
   * Flag for main info
   */
  @Input() public isGeneralInfoOpen: boolean;

  /**
   * For button in info
   */
  public get btnPlaceholder(): string {
    return !this.isGeneralInfoOpen ? LocaleText.show : LocaleText.hide;
  }

  constructor(
    private changeDetection: ChangeDetectorRef
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();
  }

  /**
   * Change data and update
   * @param changes Input data from parent
   */
  ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {
    this.detectChanges();
  }

  /**
   * Destruction of the component
   */
  ngOnDestroy(): void {
    this.data = null;
    this.skeletonArray = null;
    this.skeletalAnimation = null;
    this.header = null;
    this.isGeneralInfoOpen = null;
  }

  /**
   * Method for ngFor optimization (Skeleton list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  identifySkeleton(index: number, item: number): number { return item; }

  /**
   * Method for ngFor optimization (ViewerData list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  identifyData(index: number, item: ViewerData): string { return item.value; }

  /**
   * Show/Hide info about TON
   */
  onShowOrHide(): void {
    this.isGeneralInfoOpen = !this.isGeneralInfoOpen;
    this.detectChanges();
  }

  /**
   * Detect Changes for optimization
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
