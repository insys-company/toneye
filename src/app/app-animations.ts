import { trigger, animateChild, group, transition, animate, style, query} from '@angular/animations';

// Routable animations
export const routeAnimation =
    trigger('routeAnimation', [
        transition('* => home', [
            style({ position: 'relative' }),
            query(':enter, :leave', [
                style({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%'
                })
            ], {optional: true}),
            query(':enter', [
                style({ left: '-100%' })
            ], {optional: true}),
            query(':leave', animateChild(), {optional: true}),
            group([
                query(':leave', [
                    animate('300ms ease-out', style({ left: '100%' }))
                ], {optional: true}),
                query(':enter', [
                    animate('300ms ease-out', style({ left: '0%' }))
                ], {optional: true})
            ]),
            query(':enter', animateChild(), {optional: true}),
        ]),
        transition('details => list', [
            style({ position: 'relative' }),
            query(':enter, :leave', [
                style({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%'
                })
            ], {optional: true}),
            query(':enter', [
                style({ left: '-100%' })
            ], {optional: true}),
            query(':leave', animateChild(), {optional: true}),
            group([
                query(':leave', [
                    animate('300ms ease-out', style({ left: '100%' }))
                ], {optional: true}),
                query(':enter', [
                    animate('300ms ease-out', style({ left: '0%' }))
                ], {optional: true})
            ]),
            query(':enter', animateChild(), {optional: true}),
        ]),
        transition('home => *', [
            style({ position: 'relative' }),
            query(':enter, :leave', [
                style({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%'
                })
            ], {optional: true}),
            query(':enter', [
                style({ left: '+100%' })
            ], {optional: true}),
            query(':leave', animateChild(), {optional: true}),
            group([
                query(':leave', [
                    animate('300ms ease-out', style({ left: '-100%' }))
                ], {optional: true}),
                query(':enter', [
                    animate('300ms ease-out', style({ left: '0%' }))
                ], {optional: true})
            ]),
            query(':enter', animateChild(), {optional: true}),
        ]),
        transition('list => details', [
            style({ position: 'relative' }),
            query(':enter, :leave', [
                style({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%'
                })
            ], {optional: true}),
            query(':enter', [
                style({ left: '+100%' })
            ], {optional: true}),
            query(':leave', animateChild(), {optional: true}),
            group([
                query(':leave', [
                    animate('300ms ease-out', style({ left: '-100%' }))
                ], {optional: true}),
                query(':enter', [
                    animate('300ms ease-out', style({ left: '0%' }))
                ], {optional: true})
            ]),
            query(':enter', animateChild(), {optional: true}),
        ]),
        transition('list => list', [
            style({ position: 'relative' }),
            query(':enter, :leave', [
                style({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%'
                })
            ], {optional: true}),
            query(':enter', [
                style({ left: '+100%' })
            ], {optional: true}),
            query(':leave', animateChild(), {optional: true}),
            group([
                query(':leave', [
                    animate('300ms ease-out', style({ left: '-100%' }))
                ], {optional: true}),
                query(':enter', [
                    animate('300ms ease-out', style({ left: '0%' }))
                ], {optional: true})
            ]),
            query(':enter', animateChild(), {optional: true}),
        ])
    ]);

// after skeleton elements
export const smoothDisplayAfterSkeletonAnimation = 
    trigger('smoothDisplayAnimation', [
        transition(':enter', [
            style({ opacity: '0' }),
            animate('.3s linear', style({ opacity: '1' }))
        ]),
        // transition(':leave', [
        //     style({ opacity: '1' }),
        //     animate('0s ease', style({ opacity: '0' }))
        // ])
    ]);

// Search panel
export const smoothSearchPanelAnimation = 
    trigger('searchPanelAnimation', [
        transition(':enter', [
            style({ 'opacity': '0', 'max-height': '0' }),
            animate('.3s ease', style({ 'opacity': '1', 'max-height': '500px' }))
        ]),
        transition(':leave', [
            style({ 'opacity': '1', 'max-height': '500px' }),
            animate('.3s ease', style({ 'opacity': '0', 'max-height': '0' }))
        ])
    ]);

// // Search panel
// export const smoothSearchPanelContentAnimation = 
//     trigger('searchPanelContentAnimation', [
//         transition(':enter', [
//             style({ 'opacity': '0', 'max-height': '0' }),
//             animate('.5s linear', style({ 'opacity': '1', 'max-height': '500px' }))
//         ]),
//         transition(':leave', [
//             style({ 'opacity': '1', 'max-height': '500px' }),
//             animate('.3s linear', style({ 'opacity': '0', 'max-height': '0' }))
//         ])
//     ]);

// export const smoothSearchPanelNotFoundAnimation = 
//     trigger('searchPanelNotFoundAnimation', [
//         transition(':enter', [
//             style({ opacity: '0', 'max-height': '0' }),
//             animate('.5s linear', style({ opacity: '1', 'max-height': '20px' }))
//         ]),
//         transition(':leave', [
//             style({ opacity: '1', 'max-height': '20px' }),
//             animate('.3s linear', style({ opacity: '0',  'max-height': '0' }))
//         ])
//     ]);
    