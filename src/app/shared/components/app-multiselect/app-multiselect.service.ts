import { Injectable, ViewContainerRef, Injector } from '@angular/core';
import { MULTISELECT_PANEL_DATA, AppMultiselectOverlayComponent } from './app-multiselect-overlay/app-multiselect-overlay.component';
import { Overlay, OverlayRef, OverlayConfig, PositionStrategy, ConnectionPositionPair, ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';

@Injectable({
    providedIn: 'root'
})
export class AppMultiselectService {
    /**
     * Экземпляр объекта для создания портейла с
     * шаблоном  AppPaginatorOverlayComponent
     * @type {componentPortal}
     */
    private componentPortal: ComponentPortal<AppMultiselectOverlayComponent>;
    /**
     * Объект для overlay
     * @type {OverlayRef}
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
     *
     * @returns {void}
     */
    createOverlay(data: any, overlayConfig: OverlayConfig): void {
        this.overlayRef = this.overlay.create(new OverlayConfig(overlayConfig));
        this.componentPortal = new ComponentPortal(
            AppMultiselectOverlayComponent,
            this.viewContainerRef,
            this.createInjector({ data })
        );
    }

    /**
     * Открытие overlay
     * @returns {void}
     */
    openPanel(): void {
        this.overlayRef.attach(this.componentPortal);
    }

    /**
     * Закрытие overlay
     * @returns {void}
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
        injectorTokens.set(MULTISELECT_PANEL_DATA, data);
        return new PortalInjector(this.injector, injectorTokens);
    }

    /**
     * Стратегия для расположения overlay
     * @param {any} target Элемента относительно которого будет overlay
     *
     * @returns {PositionStrategy}
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

    /**
     * Дефолтный список для примера
     * @returns {any[]}
     */
    setDefaultOptions(): any[] {
        return [
            { id: '0', name: 'Option 1'},
            { id: '1', name: 'Option 2'},
            { id: '2', name: 'Option 3' },
            { id: '3', name: 'Option 4' },
            { id: '4', name: 'Option 5' },
            { id: '5', name: 'Option 6' },
            { id: '6', name: 'Option 7' }
        ];
    }
}
