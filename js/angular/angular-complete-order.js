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

            mixpanel.track("Complete order Page Viewed", { 'offerId': offerId, 'noOfPersons': noOfPersons });
        }, 300);

        $scope.completeOrder = function () {
            $('#completeOrderModal').modal({ backdrop: 'static' });
            mixpanel.track("Complete order button clicked");
        };

        $scope.$watch('quantity', function () {
            if ($scope.offer)
                $scope.total = $scope.offer.offerPrice * $scope.quantity;

            if ($scope.quantity > 1)
                mixpanel.track("Quantity changed", { 'quantity': $scope.quantity });
        });

        $scope.termsAndConditionsClicked = function () {
            mixpanel.track("Terms and conditions clicked");
        };

        $scope.privacyStatementClicked = function () {
            mixpanel.track("Privacy statement clicked");
        };

        $scope.orderFaqFirstSectionClicked = function () {
            mixpanel.track("Payment FAQ - What happens after I click 'Complete order'");
        };

        $scope.orderFaqSecondSectionClicked = function () {
            mixpanel.track("Payment FAQ - What happens after I buy?");
        };

        $scope.orderFaqThirdSectionClicked = function () {
            mixpanel.track("Payment FAQ - Can I change or cancel my purchase?");
        };

        $scope.orderFaqFourthSectionClicked = function () {
            mixpanel.track("Payment FAQ - Is this safe?");
        };
    });

    priceMetApp.controller('CompleteOrderModalCtrl', function ($scope, $timeout) {
        $scope.showErrorMsg = false;

        $('#completeOrderModal').on('show.bs.modal', function () {
            $scope.showErrorMsg = false;
            $scope.showEmailError = false;
            $scope.sentEmailAddress = false;

            $timeout(function () {
                $scope.showErrorMsg = true;
            }, 8000);
        });

        $scope.sendEmail = function () {
            var validEmail = validateEmail($scope.email);

            $scope.showEmailError = false;

            mixpanel.track("Complete order Send Email", { 'email': $scope.email });

            if (!validEmail)
                return $scope.showEmailError = true;

            $scope.sentEmailAddress = true;
            saveEmail($scope.email);
        };
    });

    priceMetApp.controller('headerCtrl', function ($scope, $timeout) {
        $scope.logIn = function () {
            $timeout(function () {
                swal({ title: 'Oops', text: 'There seems to be a problem. Please try again later, we are very sorry.', type: 'error' });
            }, 2000);
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", { 'option': 'log in' });
        };

        $scope.getInTouch = function () {
            $('footer').scrollintoview({ duration: 500 });
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", { 'option': 'contact us' });
        };

        $scope.needHelp = function () {
            $('footer').scrollintoview({ duration: 500 });
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", { 'option': 'help' });
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