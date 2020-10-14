import { trigger, animateChild, group, transition, animate, style, query} from '@angular/animations';

// Routable animations
export const appRouteAnimation =
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


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/