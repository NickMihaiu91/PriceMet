(function () {

    var priceMetApp = angular.module('priceMetApp', ['ngAnimate', 'offersServiceModule', 'restaurantsLookingAtRequestServiceModule']);

    priceMetApp.controller('OfferListCtrl', function ($scope, $rootScope, $interval, $timeout, offersService, restaurantsLookingAtRequestService) {
        var LOADING_BAR_INTERVAL = 400; //ms
        $scope.showForm = false;
        $scope.formStep = 1;
        $scope.showError = false;
        $scope.offersVisible = false;
        $scope.interactedWithEmailInputOnLoadingScreen = false;
        $scope.noOfPersonsTextRepresentation = 'one';
        $scope.sentEmailAddress = false;

        $('#offerModal').on('shown.bs.modal', function () {
            var budget = $('#inputBudget').val() || $('#selectBudget option:selected').text().trim(),
               noOfPersons = $('#selectNoOfPersons option:selected').text(),
               location = $('#inputLocation').val() || $('#selectLocation option:selected').text();

            offersService.stopShowingMoreOffers();

            $scope.noOfOffers = 0;
            $scope.noOfPersonsTextRepresentation = formatNoOfPersonsToTextRepresentation(noOfPersons);
            $scope.loadingBarProgress = 20;
            $scope.progressBarStyle = { 'width': $scope.loadingBarProgress + '%' };
            $scope.offerSummary = 'Restaurant offers for {0}, C${1} budget, {2}'.format($scope.noOfPersonsTextRepresentation, budget, location);
            $scope.$apply();

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
            return restaurantsLookingAtRequestService.storedValues.noOfRestaurantsWatchingBid;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.noOfRestaurantsWatchingBid = newVal;
            }
        });

        $scope.$watch(function () {
            return offersService.storedValues.limitTo;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.noOfOffers = newVal;
                toastr.success('You have a new offer from a restaurant!');
            }
        });

        var unregisterShowFormWatch = $scope.$watch('showForm', function () {
            if ($scope.showForm && !$('#datepicker').data('datepicker')) {
                $('#datepicker').datepicker({ startDate: new Date(), todayHighlight: true })
                    .on('changeDate', function (e) {
                    $rootScope.dateUntil = e.format('MM d, yyyy');
                })
                unregisterShowFormWatch();
            }
        });

        $rootScope.$watch('dateUntil', function () {
            if($rootScope.dateUntil)
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
            saveEmail($scope.emailOnLoadingScreen);
        };

        $scope.showOffers = function () {
            var budget = $('#inputBudget').val() || $('#selectBudget option:selected').text(),
                noOfPersons = $('#selectNoOfPersons option:selected').text(),
                location = $('#inputLocation').val() || $('#selectLocation option:selected').text();

            offersService.getOffers(budget, noOfPersons, function (offers) {
                $scope.offerList = offers;
                $scope.noOfOffers = offersService.storedValues.limitTo;
            });

            $scope.noOfRestaurantsWatchingBid = restaurantsLookingAtRequestService.initialize();

            $scope.offersVisible = true;
        };

        $scope.getMoreOffers = function () {
            $scope.showForm = true;
        };

        $scope.setDate = function () {
            if (!$rootScope.dateUntil)
                 return $scope.showError = true;

            $scope.formStep++;
        };

        $scope.setEmail = function () {
            var validEmail = validateEmail($scope.email),
                trackObj = { 'dateUntil': $rootScope.dateUntil };

            if ($scope.email)
                trackObj['send email'] = $scope.email;

            mixpanel.track("Modal", trackObj);

            if (!validEmail)
                return $scope.showError = true;

            saveEmail($scope.email, $rootScope.dateUntil);
            $scope.formStep++;
        };

        $scope.goBackToOffers = function () {
            $scope.showForm = false;
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