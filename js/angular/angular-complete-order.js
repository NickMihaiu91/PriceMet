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

        $scope.completeOrder = function () {
            $('#completeOrderModal').modal({ backdrop: 'static' });
        };

        $scope.$watch('quantity', function () {
            if ($scope.offer)
                $scope.total = $scope.offer.offerPrice * $scope.quantity;
        });
    });

    priceMetApp.controller('CompleteOrderModalCtrl', function ($scope, $timeout) {
        $scope.showErrorMsg = false;

        $('#completeOrderModal').on('show.bs.modal', function () {
            $scope.showErrorMsg = false;
            $scope.showEmailError = false;
            $scope.sentEmailAddress = false;

            $timeout(function () {
                $scope.showErrorMsg = true;
            }, 5000);
        });

        $scope.sendEmail = function () {
            var validEmail = validateEmail($scope.email);

            $scope.showEmailError = false;

            if (!validEmail)
                return $scope.showEmailError = true;

            $scope.sentEmailAddress = true;
            saveEmail($scope.email);
        };
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

    function validateEmail(email) {
        var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(email);
    }

    function saveEmail(email) {
        var EmailObject = Parse.Object.extend("Email"),
            emailObject = new EmailObject();

        emailObject.save({
            email: email
        });
    }
})();