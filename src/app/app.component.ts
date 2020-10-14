import { Component, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { appRouteMap } from './app-route-map';
import { RouterOutlet, Router } from '@angular/router';
import { appRouteAnimation } from './app-route-animations';
import { Breadcrumbs } from './api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [ appRouteAnimation ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnDestroy {
  /**
   * Account's link
   */
  private accounts: string = appRouteMap.accounts;
  /**
   * Blocks's link
   */
  private blocks: string = appRouteMap.blocks;
  /**
   * Messages's link
   */
  private messages: string = appRouteMap.messages;
  /**
   * Transactions's link
   */
  private transactions: string = appRouteMap.transactions;
  /**
   * Validators's link
   */
  private validators: string = appRouteMap.validators;
  /**
   * Home's link
   */
  private home: string = appRouteMap.home;
  /**
   * Array of links
   */
  public links: Array<string> = [
    this.home,
    this.blocks,
    this.transactions,
    this.messages,
    this.accounts,
    // this.validators
  ];

  /**
   * Flag for mobile menu and mobile menu icon
   */
  public isMenuOpened: boolean;
  /**
   * Breadcrumbs object for pages
   */
  public breadcrumbs: Breadcrumbs[];

  constructor(
    private router: Router,
  ) {
    this.isMenuOpened = false;
    this.breadcrumbs = [];
    this.breadcrumbs = [
      new Breadcrumbs({ name: appRouteMap.home, url: appRouteMap.home }),
      new Breadcrumbs({ name: appRouteMap.blocks, url: appRouteMap.blocks }),
      new Breadcrumbs({ name: appRouteMap.transactions, url: appRouteMap.transactions }),
      new Breadcrumbs({ name: appRouteMap.messages, url: appRouteMap.messages }),
      new Breadcrumbs({ name: appRouteMap.accounts, url: appRouteMap.accounts })
    ];
  }

  /**
   * Destruction of the component
   */
  ngOnDestroy(): void {
    this.accounts = null;
    this.blocks = null;
    this.messages = null;
    this.transactions = null;
    this.validators = null;
    this.home = null;
    this.links = null;
    this.isMenuOpened = null;
    this.breadcrumbs = null;
  }

  /**
   * Method for ngFor optimization (Menu)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  identifyMenu(index: number, item: string): string { return item; }

  /**
   * Method for ngFor optimization (Breadcrumbs list)
   * @param index Item index in ngFor
   * @param item Item in ngFor
   */
  identifyBreadcrumbs(index: number, item: any): string { return item.name; }

  /**
   * Method for route animation
   * @param outlet Router outlet for animation
   */
  prepareRouteForAnimation(outlet: RouterOutlet): any {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }

  /**
   * Redirect by link from breadcrumbs
   * @param indexOfItem Index of selected item
   * @param item Selected breadcrumb
   */
  onRedirect(indexOfItem: number, item: Breadcrumbs): void {
    if (item.url != null && indexOfItem !== (this.breadcrumbs.length - 1)) {
      this.router.navigate([`/${item.url}`]);
    }
  }
}
