/**
 * @file
 * Controllers for media edit
 */

/**
 * Media controller. Controls media editing functions.
 */
angular.module('ikApp').controller('MediaEditController', ['$scope', '$controller', '$location', '$routeParams', '$timeout', 'mediaFactory', 'busService', 'userService',
  function ($scope, $controller, $location, $routeParams, $timeout, mediaFactory, busService, userService) {
    'use strict';

    $controller('BaseEntityController', {$scope: $scope, entityType: 'media'});

    $scope.loading = true;

    // Get the selected media
    mediaFactory.getMedia($routeParams.id).then(
      function success(data) {
        $timeout(function () {
          $scope.media = data;

          if ($scope.media === {}) {
            $location.path('/media-overview');
          }
        });
      },
      function error(reason) {
        busService.$emit('log.error', {
          'cause': reason,
          'msg': 'Kunne ikke hente media med id: ' + $routeParams.id
        });
        $location.path('/media-overview');
      }
    ).then(function () {
      $scope.loading = false;
    });

    /**
     * Update an image.
     */
    $scope.updateMedia = function () {
      $scope.loading = true;

      mediaFactory.updateMedia($scope.media).then(
        function success() {
          $timeout(function() {
            busService.$emit('log.info', {
              'msg': 'Media opdateret.',
              'timeout': 3000
            });
          });
        },
        function error(reason) {
          busService.$emit('log.error', {
            'cause': reason,
            'msg': 'Opdatering af media fejlede.'
          });
        }
      ).then(function () {
        $scope.loading = false;
      });
    };

    /**
     * Delete an image.
     */
    $scope.delete = function () {
      $scope.loading = true;

      mediaFactory.deleteMedia($scope.media.id).then(
        function success() {
          busService.$emit('log.info', {
            'msg': 'Media slettet.',
            'timeout': 3000
          });
          $timeout(function () {
            $location.path('/media-overview');
          }, 500);
        },
        function error(reason) {
          busService.$emit('log.error', {
            'cause': reason,
            'msg': 'Sletning af media fejlede.'
          });
        }
      ).then(function () {
        $scope.loading = false;
      });
    };

    /**
     * Get the content type of a media: image or media
     * @param media
     * @returns {*}
     */
    $scope.getContentType = function (media) {
      if (!media) {
        return "";
      }

      var type = media.content_type.split("/");
      return type[0];
    };
  }
]);
