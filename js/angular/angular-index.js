(function () {

    var priceMetApp = angular.module('priceMetApp', ['ngAnimate', 'offersServiceModule', 'restaurantsLookingAtRequestServiceModule']);

    priceMetApp.controller('OfferListCtrl', function ($scope, $rootScope, $interval, offersService, restaurantsLookingAtRequestService) {
        $scope.showForm = false;
        $scope.formStep = 1;
        $scope.showError = false;
        $scope.noOfPersonsTextRepresentation = 'one';

        $('#offerModal').on('shown.bs.modal', function () {
            var budget = $('#inputBudget').val() || $('#selectBudget option:selected').text(),
                noOfPersons = $('#selectNoOfPersons option:selected').text();

            offersService.getOffers(budget, noOfPersons, function (offers) {
                $scope.offerList = offers;
                $scope.noOfOffers = offersService.storedValues.limitTo;
            });

            $scope.noOfOffers = 0;
            $scope.noOfPersonsTextRepresentation = formatNoOfPersonsToTextRepresentation(noOfPersons);
            $scope.noOfRestaurantsWatchingBid = restaurantsLookingAtRequestService.initialize();
            $scope.$apply();
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
                EmailObject = Parse.Object.extend("Email"),
                emailObject = new EmailObject(),
                trackObj = { 'dateUntil': $rootScope.dateUntil };

            if ($scope.email)
                trackObj['send email'] = $scope.email;

            mixpanel.track("Modal", trackObj);

            if (!validEmail)
                return $scope.showError = true;

            emailObject.save({
                email: $scope.email,
                dateUntil: $rootScope.dateUntil,
                budget: $('#inputBudget').val() || $('#selectBudget option:selected').text(),
                location: $('#inputLocation').val() || $('#selectLocation option:selected').text()
            }).then(function (object) { });
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

    function validateEmail(email) {
        var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(email);
    }

    function formatNoOfPersonsToTextRepresentation(noOfPersons) {
        var textValues = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        return textValues[noOfPersons];
    }
})();