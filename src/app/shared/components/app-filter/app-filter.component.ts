import { Component, OnChanges, OnInit, OnDestroy, Input, ChangeDetectorRef, SimpleChange, ChangeDetectionStrategy } from '@angular/core';

/**
 * This component displays filters on list pages.
 */
@Component({
  selector: 'app-filter',
  templateUrl: './app-filter.component.html',
  styleUrls: ['./app-filter.component.scss'],
  // animations: [ smoothDisplayAfterSkeletonAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFilterComponent implements OnChanges, OnInit, OnDestroy {
  /**
   * Data for view
   */
  @Input() public data: Array<any>;
  /**
   * Flag for loading data
   */
  @Input() public skeletalAnimation: boolean = true;
  /**
   * For skeleton animation
   */
  public skeletonArray: Array<number> = new Array(4);
  /**
   * Flag for main info
   */
  public isFilterOpen: boolean;

  /**
   * For button in info
   */
  public get btnPlaceholder(): string {
    return !this.isFilterOpen ? 'Show' : 'Hide';
  }

  constructor(
    private changeDetection: ChangeDetectorRef
  ) {
    /** Disable change detection for application optimization */
    this.changeDetection.detach();

    this.isFilterOpen = false;
  }

  /**
   * Change data and update
   * @param changes Input data from parent
   */
  ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {
    // this.detectChanges();
  }

  /**
   * Initialization of the component
   */
  ngOnInit(): void {
    this.detectChanges();
    // TODO
  }

  /**
   * Destruction of the component
   */
  ngOnDestroy(): void {
    this.data = null;
    this.skeletonArray = null;
    this.skeletalAnimation = null;
    this.isFilterOpen = null;
  }

  /**
   * Method for ngFor optimization (Skeleton list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  identifySkeleton(index: number, item: number): number { return item; }

  /**
   * Show/Hide filter
   */
  onShowOrHide(): void {
    this.isFilterOpen = !this.isFilterOpen;
    this.detectChanges();
  }

  /**
   * Detect Changes for optimization
   */
  private detectChanges(): void {
    this.changeDetection.detectChanges();
  }
}
