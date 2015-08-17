(function () {

    var priceMetApp = angular.module('priceMetApp', ['ngAnimate', 'offersServiceModule', 'merchantsLookingAtRequestServiceModule']);

    priceMetApp.controller('OfferListCtrl', function ($scope, $rootScope, $interval, $timeout, offersService, merchantsLookingAtRequestService) {
        var LOADING_BAR_INTERVAL = 400; //ms
        $scope.showForm = false;
        $scope.formStep = 1;
        $scope.showError = false;
        $scope.offersVisible = false;
        $scope.interactedWithEmailInputOnLoadingScreen = false;
        $scope.noOfPersonsTextRepresentation = 'one';
        $scope.sentEmailAddress = false;

        $rootScope.safeApply = function (fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        $('#offerModal').on('shown.bs.modal', function () {
            var budget = $('#inputBudget').val() || $('#selectBudget option:selected').text().trim(),
               noOfPersons = $('#selectNoOfPersons option:selected').text(),
               location = $('#inputLocation').val() || $('#selectLocation option:selected').text(),
               offerTypeText = $('#selectOfferType option:selected').text().trim();

            offersService.stopShowingMoreOffers();

            $scope.noOfOffers = 0;
            $scope.noOfPersons = noOfPersons;
            $scope.noOfPersonsTextRepresentation = formatNoOfPersonsToTextRepresentation(noOfPersons);
            $scope.loadingBarProgress = 20;
            $scope.progressBarStyle = { 'width': $scope.loadingBarProgress + '%' };
            $scope.offerSummary = '{0} offers for {1}, C${2} budget, {3}'.format(offerTypeText, $scope.noOfPersonsTextRepresentation, budget, location);
            $scope.merchantType = offerTypeText === 'Restaurant' ? offerTypeText.toLowerCase() + 's' : 'salons';
            $scope.offerTypeText = offerTypeText;
            $rootScope.safeApply();

            (function increaseLoadingBar() {
                if ($scope.loadingBarProgress < 100)
                    $timeout(function () {
                        $scope.loadingBarProgress += 2;
                        $scope.progressBarStyle = { 'width': $scope.loadingBarProgress + '%' };
                        increaseLoadingBar();
                    }, LOADING_BAR_INTERVAL);
                else
                    if (!$scope.interactedWithEmailInputOnLoadingScreen)
                        $scope.showOffers();
            })();
        });

        $('#offerModal').on('hidden.bs.modal', function () {
            $scope.offersVisible = false;
            $scope.interactedWithEmailInputOnLoadingScreen = false;
            $scope.showError = false;
            $scope.showForm = false;
        });

        $scope.$watch(function () {
            return merchantsLookingAtRequestService.storedValues.noOfMerchantsWatchingBid;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.noOfMerchantsWatchingBid = newVal;
            }
        });

        $scope.$watch(function () {
            return offersService.storedValues.limitTo;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.noOfOffers = newVal;
                toastr.options.timeOut = 10000;
                toastr.info('You have a new offer from a ' + $scope.merchantType.slice(0, -1) + '!');
            }
        });

        var unregisterShowFormWatch = $scope.$watch('showForm', function () {
            if ($scope.showForm && !$('#datepicker').data('datepicker')) {
                $('#datepicker').datepicker({ startDate: new Date(), todayHighlight: true })
                    .on('changeDate', function (e) {
                        $scope.dateUntil = e.format('MM d, yyyy');
                        $rootScope.safeApply();
                })
                unregisterShowFormWatch();
            }
        });

        $scope.$watch('dateUntil', function () {
            if ($scope.dateUntil)
                $scope.showError = false;
        });

        $scope.focusOnEmail = function () {
            $scope.interactedWithEmailInputOnLoadingScreen = true;
        };

        $scope.sendEmail = function () {
            var validEmail = validateEmail($scope.emailOnLoadingScreen);

            $scope.interactedWithEmailInputOnLoadingScreen = true;
            $scope.showError = false;

            if (!validEmail)
                return $scope.showError = true;

            $scope.sentEmailAddress = true;
            $rootScope.safeApply();
            saveEmail($scope.emailOnLoadingScreen);
        };

        $scope.showOffers = function () {
            var budget = $('#inputBudget').val() || $('#selectBudget option:selected').text(),
                noOfPersons = $('#selectNoOfPersons option:selected').text(),
                location = $('#inputLocation').val() || $('#selectLocation option:selected').text(),
                offerType = $('#selectOfferType option:selected').val();

            offersService.getOffers(budget, noOfPersons, offerType, function (offers) {
                $scope.offerList = offers;
                $scope.noOfOffers = offersService.storedValues.limitTo;
            });

            $scope.noOfMerchantsWatchingBid = merchantsLookingAtRequestService.initialize();

            $scope.offersVisible = true;
            $rootScope.safeApply();
        };

        $scope.getMoreOffers = function () {
            $scope.showForm = true;
            $rootScope.safeApply();
        };

        $scope.setDate = function () {
            if (!$scope.dateUntil)
                 return $scope.showError = true;

            $scope.formStep++;
            $rootScope.safeApply();
        };

        $scope.setEmail = function () {
            var validEmail = validateEmail($scope.email),
                trackObj = { 'dateUntil': $scope.dateUntil };

            if ($scope.email)
                trackObj['send email'] = $scope.email;

            mixpanel.track("Modal", trackObj);

            if (!validEmail)
                return $scope.showError = true;

            saveEmail($scope.email, $scope.dateUntil);
            $scope.formStep++;
            $rootScope.safeApply();
        };

        $scope.goBackToOffers = function () {
            $scope.showForm = false;
            $rootScope.safeApply();
        };
    });

    priceMetApp.directive('ticker', function () {
        return {
            link: function (scope, element, attrs) {
                var threshold;

                var last, deferTimer;
                threshold = 800;
                scope.$watch(attrs.ticker, function (val, oldVal) {
                    if (val === oldVal) return;
                    var flickr = function (element) {
                        element.fadeOut(200);
                        element.fadeIn(200);
                        element.fadeOut(200);
                        element.fadeIn(200);
                    }
                    //Throttle excessive updates
                    var now = +new Date(), args = arguments;
                    if (last && now < last + threshold) {
                        // hold on to it
                        clearTimeout(deferTimer);
                        deferTimer = setTimeout(function () {
                            last = now;
                            flickr(element)
                        }, threshold);
                    } else {
                        last = now;
                        flickr(element);
                    }
                });
            }
        }
    });

    function saveEmail(email, dateUntil) {
        var EmailObject = Parse.Object.extend("Email"),
            emailObject = new EmailObject();

        emailObject.save({
            email: email,
            dateUntil: dateUntil,
            budget: $('#inputBudget').val() || $('#selectBudget option:selected').text(),
            location: $('#inputLocation').val() || $('#selectLocation option:selected').text()
        });
    }

    function validateEmail(email) {
        var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(email);
    }

    function formatNoOfPersonsToTextRepresentation(noOfPersons) {
        var textValues = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        return textValues[noOfPersons];
    }
})();