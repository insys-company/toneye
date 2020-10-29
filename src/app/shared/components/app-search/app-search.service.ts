import { Injectable, ViewContainerRef, Injector } from '@angular/core';
import { SEARCH_PANEL_DATA, AppSearchOverlayComponent } from './app-search-overlay/app-search-overlay.component';
import { Overlay, OverlayRef, OverlayConfig, PositionStrategy, ConnectionPositionPair, ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root'
})
export class AppSearchService {
  /**
   * Экземпляр объекта для создания портейла с шаблоном
   */
  private componentPortal: ComponentPortal<AppSearchOverlayComponent>;
  /**
   * Объект для overlay
   */
  overlayRef: OverlayRef;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private injector: Injector,
    private sso: ScrollStrategyOptions,
  ) { }

  /**
   * Создание
   * @param {any} data Данные для overlay
   * @param {any} overlayConfig Конфиги для overlay
   */
  createOverlay(data: any, overlayConfig: OverlayConfig): void {
    this.overlayRef = this.overlay.create(new OverlayConfig(overlayConfig));
    this.componentPortal = new ComponentPortal(
      AppSearchOverlayComponent,
      this.viewContainerRef,
      this.createInjector({ data })
    );
  }

  /**
   * Открытие overlay
   */
  openPanel(): void {
    this.overlayRef.attach(this.componentPortal);
  }

  /**
   * Закрытие overlay
   */
  closePanel(): void {
    if (!this.overlayRef || !this.overlayRef.hasAttached()) {
      this.overlayRef = null;
      return;
    }
    this.overlayRef.detach();
    this.overlayRef = null;
  }

  /**
   * Создание инжектора с данными для отображения
   * @param {any} data Данные для передачи
   */
  createInjector(data: any): PortalInjector {
    const injectorTokens = new WeakMap();
    injectorTokens.set(SEARCH_PANEL_DATA, data);
    return new PortalInjector(this.injector, injectorTokens);
  }

  /**
   * Стратегия для расположения overlay
   * @param {any} target Элемента относительно которого будет overlay
   */
  getPositionStrategy(target: any): PositionStrategy {
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(target)
      .withPositions(this.getPositions())
      .withPush(false);

    return positionStrategy;
  }

  /**
   * Стратегия для расположения скроллинга
   * @returns {ScrollStrategy}
   */
  getScrollStrategy(): ScrollStrategy {
    return this.sso.block();
  }

  /**
   * Позиции относительно элемента
   * @returns {ConnectionPositionPair}
   */
  getPositions(): ConnectionPositionPair[] {
    return [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom'
      },
    ]
  }
}
