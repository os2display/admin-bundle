/**
 * @file
 * Contains the directive for an editable slide.
 */

/**
 * Directive to insert html for a slide, that is editable.
 * @param ik-slide: the slide.
 * @param ik-width: the width of the slide.
 */
angular.module('ikShared').directive('ikSlideEditable', [
  'templateFactory', '$timeout',
  function (templateFactory, $timeout) {
    'use strict';

    return {
      restrict: 'E',
      scope: {
        ikWidth: '@',
        ikSlide: '='
      },
      link: function (scope, element, attrs) {
        scope.templateURL = 'bundles/os2displayadmin/apps/ikShared/elements/slide/slide-loading.html?' + window.config.version;

        // Watch for changes to ikSlide.
        scope.$watch('ikSlide', function (newVal, oldVal) {
          if (!newVal) {
            return;
          }

          if (scope.ikSlide.media_type === 'image') {
            scope.ikSlide.currentImage = '';
            if (scope.ikSlide.media.length > 0) {
              scope.ikSlide.currentImage = scope.ikSlide.media[0].urls.default_landscape;
            }
          }

          // Set the currentLogo variable.
          scope.ikSlide.currentLogo = '';
          if (scope.ikSlide.logo !== undefined && scope.ikSlide.logo !== null) {
            scope.ikSlide.currentLogo = scope.ikSlide.logo.urls.default_landscape;
          }

          if (scope.theStyle) {
            // Update font size
            scope.theStyle.fontsize = '' + parseFloat(scope.ikSlide.options.fontsize * parseFloat(scope.ikWidth / scope.template.ideal_dimensions.width)) + 'px';
          }
        }, true);

        scope.$watch('ikSlide.template', function () {
          scope.slideError = null;

          templateFactory.getSlideTemplate(scope.ikSlide.template)
            .then(
              function success (data) {
                $timeout(function () {
                  if (!data.enabled) {
                    scope.slideError = '"' + data.name + '" skabelonen er ikke aktiveret.';
                  }
                  else {
                    scope.template = data;
                    scope.slideTemplateURL = scope.template.paths.edit;
                    scope.templateURL = 'bundles/os2displayadmin/apps/ikShared/elements/slide/slide-edit.html?' + window.config.version;

                    // Setup the inline styling
                    scope.theStyle = {
                      width: '' + scope.ikWidth + 'px',
                      height: '' + parseFloat(scope.template.ideal_dimensions.height * parseFloat(scope.ikWidth / scope.template.ideal_dimensions.width)) + 'px',
                      fontsize: '' + parseFloat(scope.ikSlide.options.fontsize * parseFloat(scope.ikWidth / scope.template.ideal_dimensions.width)) + 'px'
                    };
                  }
                });
              },
              function error () {
                scope.slideError = '"' + scope.ikSlide.template + '" skabelonen blev ikke fundet.';
              }
            );
        });
      },
      template: '<div data-ng-if="slideError" class="preview--error">{{ slideError }}</div><div class="preview--slide" data-ng-style="{\'width\': theStyle.width}" data-ng-include="templateURL" data-ng-if="!slideError"></div>'
    };
  }
]);
