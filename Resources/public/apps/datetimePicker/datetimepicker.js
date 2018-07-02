/**
 * @file
 * Contains an angular wrapper for the datetime-picker jquery plugin:
 *  - jQuery DateTimePicker plugin v2.3.4
 *  - http://xdsoft.net/jqplugins/datetimepicker/
 */

/**
 * Angular wrapper for jquery.datetimepicker.js.
 * For v2.3.4
 * Only a one way binding atm.
 */
angular.module('datetimePicker', []);

/**
 * Configurable datetime picker.
 */
angular.module('datetimePicker')
    .directive('datetimePicker', function ($timeout) {
        return {
            scope: {
                config: '=',
                watch: '='
            },
            restrict: 'A',
            require: '^ngModel',
            link: function (scope, el, attrs, ctrl) {
                var dateFormat = 'DD/MM/YYYY HH:mm';
                var config = null;

                if (scope.config) {
                    config = scope.config;
                }
                else {
                    config = {
                        lang: 'da',
                        format: 'd/m/Y H:i',
                        scrollMonth: false,
                        scrollTime: false
                    };
                }

                // Wait for initialization.
                $timeout(function () {
                    if (ctrl.$modelValue) {
                        config.value = moment(ctrl.$modelValue * 1000)
                            .format(dateFormat);
                    }

                    el.datetimepicker(config);

                    ctrl.$formatters.unshift(function (modelValue) {
                        if (!modelValue) {
                            return '';
                        }

                        return moment(modelValue * 1000).format(dateFormat);
                    });

                    ctrl.$parsers.unshift(function (viewValue) {
                        if (viewValue == '') {
                            return null;
                        }

                        var date = moment(viewValue, dateFormat);
                        return (date && date.isValid() && date.year() >= 1970) ? date.unix() : null;
                    });

                    el.bind('blur', function () {
                        var date = moment(ctrl.$viewValue, dateFormat);

                        if (date && date.isValid() && date.year() >= 1970) {
                            ctrl.$modelValue = date.unix();
                        }
                        else {
                            ctrl.$modelValue = moment().unix();
                        }

                        ctrl.$setViewValue(moment(ctrl.$modelValue * 1000)
                            .format(dateFormat));
                        ctrl.$render();
                    });

                    if (scope.watch) {
                        scope.$watch(function () {
                            return ctrl.$modelValue;
                        }, function (newValue) {
                            if (!newValue) {
                                return;
                            }

                            config.value = moment(newValue * 1000)
                                .format(dateFormat);
                            el.datetimepicker('destroy');
                            el.datetimepicker(config);
                        });
                    }
                });
            }
        };
    });

/**
 * Hour picker. Results in a integer value.
 */
angular.module('datetimePicker')
    .directive('hourPicker',
        function () {
            return {
                restrict: 'A',
                require: '^ngModel',
                link: function (scope, el) {
                    el.datetimepicker({
                        datepicker: false,
                        format: 'G'
                    });
                }
            };
        }
    );

/**
 * Expose datetime picker input editable as text.
 */
angular.module('datetimePicker')
    .directive('datetimePickerText', function ($timeout) {
        return {
            restrict: 'A',
            require: '^ngModel',
            link: function (scope, el, attrs, ctrl) {
                var dateFormat = 'DD/MM/YYYY HH:mm';

                // Wait for initialization.
                $timeout(function () {
                    ctrl.$formatters.unshift(function (modelValue) {
                        if (!modelValue) {
                            return '';
                        }

                        return moment(modelValue * 1000).format(dateFormat);
                    });

                    ctrl.$parsers.unshift(function (viewValue) {
                        if (viewValue == '') {
                            return null;
                        }
                        var date = moment(viewValue, dateFormat);
                        return (date && date.isValid() && date.year() >= 1970) ? date.unix() : null;
                    });

                    if (ctrl.$modelValue) {
                        ctrl.$setViewValue(moment(ctrl.$modelValue * 1000)
                            .format(dateFormat));
                        ctrl.$render();
                    }

                    el.bind('blur', function () {
                        var date = moment(ctrl.$viewValue, dateFormat);

                        if (date && date.isValid() && date.year() >= 1970) {
                            ctrl.$modelValue = date.unix();
                        }
                        else {
                            ctrl.$modelValue = moment().unix();
                        }

                        ctrl.$setViewValue(moment(ctrl.$modelValue * 1000)
                            .format(dateFormat));
                        ctrl.$render();
                    });
                });

            }
        };
    });
