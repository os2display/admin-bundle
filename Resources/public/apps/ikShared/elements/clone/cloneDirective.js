/**
 * @file
 * Add clone button
 */

angular.module('ikShared').directive('ikClone', ['$http', '$rootScope', 'busService',
  function ($http, $rootScope, busService) {
    'use strict';

    return {
      restrict: 'E',
      replace: false,
      scope: {
        entityid: '@',
        type: '@'
      },
      link: function (scope) {
        // Handle clicks on numbers.
        scope.clone = function () {
          var result = window.confirm('Er du sikker på du vil klone dette?');
          if (result === true) {
            $http.post('/api/' + scope.type + '/' + scope.entityid + '/clone')
              .success(function () {
                busService.$emit('log.info', {
                  'msg': 'Kloningen lykkes.',
                  'timeout': 3000
                });
                $rootScope.$broadcast(scope.type + '-cloned', {});
              })
              .error(function (reason) {
                busService.$emit('log.error', {
                  'cause': reason,
                  'msg': 'Kloningen lykkes ikke!'
                });
              });
          }
        };
      },
      templateUrl: 'bundles/os2displayadmin/apps/ikShared/elements/clone/clone.html?' + window.config.version
    };
  }
]);
