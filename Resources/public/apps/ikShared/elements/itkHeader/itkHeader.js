/**
 * @file
 * itk-header directive.
 */

/**
 * itk-header DOM element.
 *
 * attributes (all required):
 *   - entity: The entity the header applies to.
 *   - type:   The entity type, e.g. screen.
 *   - event:  The name of the event to send out to request items.
 *             Will be prefixed and prefixed by itkHeader.{event}.requestItems
 *             Expects returnEvent(s) back.
 */
angular.module('ikShared').directive('itkHeader', ['busService', '$timeout', '$compile',
    function (busService, $timeout, $compile) {
        'use strict';

        return {
            restrict: 'E',
            replace: false,
            scope: {
                entity: '=',
                type: '@',
                event: '@'
            },
            link: function (scope, element) {
                // Make sure all attributes have been set.
                if (!scope.entity || !scope.type || !scope.event) {
                    console.error('itkHeader: entity, type, event attributes are all required!');
                    return;
                }

                var event = 'itkHeader.' + scope.event;
                var html = '';

                var now = new Date();
                var returnEvent = event + '.returnItems-' + scope.entity.id + '-' + now.getTime();

                busService.$on(returnEvent, function (event, data) {
                    $timeout(function () {
                        if (data.hasOwnProperty('html')) {
                            var e = angular.element(data.html);

                            element.append(e);
                            $compile(e)(scope);
                        }
                    });
                });

                busService.$emit(event + '.requestItems', {
                    entity: scope.entity,
                    scope: scope,
                    type: scope.type,
                    returnEvent: returnEvent
                });
            },
            template: ''
        };
    }
]);
