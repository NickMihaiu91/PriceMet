(function () {

    var priceMetApp = angular.module('priceMetApp', ['ngAnimate', 'offersServiceModule']);

    priceMetApp.controller('FormOfferCtrl', function ($scope, $rootScope, $timeout, offersService) {
        $scope.getOffers = function () {
            $timeout(function () {
                var newOffer = {
                    'name': 'New offer!!!',
                    'originalPrice': 35,
                    'bidPrice': 20,
                    'imgUrl': 'images/' + 'sad-puppy.jpg'
                };
                offersService.addOffer(newOffer);
                toastr.success('You have a new offer from a restaurant!');
            }, 2000);

            $('#datepicker').datepicker({ startDate: new Date(), todayHighlight: true }).on('changeDate', function (e) {
                $rootScope.dateUntil = e.format('MM d, yyyy');
            });
        };
    });

    priceMetApp.controller('OfferListCtrl', function ($scope, $rootScope, $interval, offersService) {
        $scope.showForm = false;
        $scope.formStep = 1;
        $scope.showError = false;

        $('#offerModal').on('show.bs.modal', function () {
            var budget = $('#inputBudget').val() || $('#selectBudget option:selected').text(),
                noOfPersons = $('#selectNoOfPersons option:selected').text();

            offersService.getOffers(budget, noOfPersons, function (offers) {
                $scope.offerList = offers;
            });
        });

        var MAX_NUMBER_OF_RESTAURANTS_WATCHING = 5;
        $scope.noOfRestaurantsWatchingBid = Math.floor(Math.random() * MAX_NUMBER_OF_RESTAURANTS_WATCHING) + 1;

        $interval(function () {
            $scope.noOfRestaurantsWatchingBid = Math.floor(Math.random() * MAX_NUMBER_OF_RESTAURANTS_WATCHING) + 1;
        }, 2000);

        $rootScope.$watch('dateUntil', function () {
            if($rootScope.dateUntil)
                $scope.showError = false;
        });

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

})();