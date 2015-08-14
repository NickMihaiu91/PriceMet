(function () {

    var priceMetApp = angular.module('priceMetApp', ['offersServiceModule']);

    priceMetApp.controller('CompleteOrderCtrl', function ($scope, $timeout, $location, offersService) {
        $scope.quantity = 1;

        $timeout(function () {
            Parse.initialize("rABaK3FXscnhAej5m3WNT8jQuaEHiFpwCAcGgEbv", "QkE1Q8Nsb6Fy8GkeKBJNmNidxzV2g8TIKprOEKOe");

            var offerId = getParameterByName('id'),
                noOfPersons = getParameterByName('n');

            offersService.getOfferById(offerId, noOfPersons, function (offer) {
                $scope.offer = offer;
                $scope.offer.bidOfferTitle += ' for ' + formatNoOfPersonsToTextRepresentation(noOfPersons);
                $scope.total = offer.offerPrice * $scope.quantity;
                $scope.$apply();
            });
        }, 300);

        $scope.$watch('quantity', function () {
            if ($scope.offer)
                $scope.total = $scope.offer.offerPrice * $scope.quantity;
        });
    });

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function formatNoOfPersonsToTextRepresentation(noOfPersons) {
        var textValues = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        return textValues[noOfPersons];
    }
})();