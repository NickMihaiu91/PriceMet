(function () {

    var priceMetApp = angular.module('priceMetApp', ['ngAnimate', 'offersServiceModule', 'merchantsLookingAtRequestServiceModule', 'toastrServiceModule']);

    priceMetApp.controller('OfferListCtrl', function ($scope, $rootScope, $interval, $timeout, offersService, merchantsLookingAtRequestService, toastrService) {
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
            var budget = $('#inputBudget').val() || $('.mobile-input-container #selectBudget').val().match(/\d+/g)[0],
               noOfPersons = $('#selectNoOfPersons option:selected').val() || $('.mobile-input-container #selectNoOfPersons').val().match(/\d+/g)[0],
               location = $('#inputLocation').val() || $('.mobile-input-container #selectLocation').val(),
               offerTypeText = getOfferCategoryName();

            offersService.stopShowingMoreOffers();

            $scope.noOfOffers = 0;
            $scope.noOfPersons = noOfPersons;
            $scope.noOfPersonsTextRepresentation = formatNoOfPersonsToTextRepresentation(noOfPersons);
            $scope.loadingBarProgress = 20;
            $scope.progressBarStyle = { 'width': $scope.loadingBarProgress + '%' };
            $scope.offerSummary = '{0} offers for {1}, ${2} budget, {3}'.format(offerTypeText, $scope.noOfPersonsTextRepresentation, budget, location);
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

            mixpanel.track("Closed modal");
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
                var toastContent = 'You have a new offer from a ' + $scope.merchantType.slice(0, -1) + '!';
                toastrService.showToastr('info', toastContent, 9000, null, function () {
                    $('#offer' + ($scope.noOfOffers - 1)).scrollintoview({ duration: 500 });
                    mixpanel.track('Toastr clicked', { offerNo: $scope.noOfOffers });
                });

                mixpanel.track($scope.noOfOffers + " offer viewed");
            }
        });

        var unregisterShowFormWatch = $scope.$watch('showForm', function () {
            if ($scope.showForm && !$('#datepicker').data('datepicker')) {
                $('#datepicker').datepicker({ startDate: new Date(), todayHighlight: true })
                    .on('changeDate', function (e) {
                        $scope.dateUntil = e.format('MM d, yyyy');
                        $rootScope.safeApply();
                        mixpanel.track("Picked date", { date: $scope.dateUntil });
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
            mixpanel.track("Email focus - Offer Alerts Modal");
        };

        $scope.sendEmail = function () {
            var validEmail = validateEmail($scope.emailOnLoadingScreen);

            $scope.interactedWithEmailInputOnLoadingScreen = true;
            $scope.showError = false;
            mixpanel.track("Send email - Offer Alerts Modal", { email: $scope.emailOnLoadingScreen });

            if (!validEmail)
                return $scope.showError = true;

            $scope.sentEmailAddress = true;
            $rootScope.safeApply();
            saveEmail($scope.emailOnLoadingScreen);
        };

        $scope.showOffers = function () {
            var budget = $('#inputBudget').val() || $('.mobile-input-container #selectBudget').val().match(/\d+/g)[0],
                noOfPersons = $('#selectNoOfPersons option:selected').val() || $('.mobile-input-container #selectNoOfPersons').val().match(/\d+/g)[0],
                location = $('#inputLocation').val() || $('.mobile-input-container #selectLocation').val(),
                offerType = getOfferCategoryId();

            offersService.getOffers(budget, noOfPersons, offerType, function (offers) {
                $scope.offerList = offers;
                $scope.noOfOffers = offersService.storedValues.limitTo;
            });

            $scope.noOfMerchantsWatchingBid = merchantsLookingAtRequestService.initialize();

            $scope.offersVisible = true;
            $rootScope.safeApply();

            mixpanel.track("Blank offers list");
        };

        $scope.getMoreOffers = function () {
            $scope.showForm = true;
            $rootScope.safeApply();

            mixpanel.track('Get more offers in your inbox - clicked button');
        };

        $scope.acceptBid = function (offerId) {
            mixpanel.track("Accept bid", { offerId: offerId, noOfOffersDisplayed: $scope.noOfOffers });
        };

        $scope.setDate = function () {
            mixpanel.track('Set date - button clicked', { date: $scope.dateUntil });

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

            mixpanel.track("Get more offers - send email", trackObj);

            if (!validEmail)
                return $scope.showError = true;

            saveEmail($scope.email, $scope.dateUntil);
            $scope.formStep++;
            $rootScope.safeApply();
        };

        $scope.goBackToOffers = function () {
            $scope.showForm = false;
            $rootScope.safeApply();

            mixpanel.track("Back to offers -  clicked button");
        };
    });

    priceMetApp.controller('MobileInputCtrl', function ($scope) {
        var categoryId = getOfferCategoryId();

        $scope.canadaCitiesList = ["Vancouver", "Burnaby", "Coquitlam", "Delta", "Langley", "Lions Bay", "Maple Ridge", "New Westminster", "North Vancouver", "Pitt Meadows", "Port Coquitlam", "Port Moody", "Richmond", "Surrey", "West Vancouver", "White Rock"];
        $scope.selectedCity = 'Vancouver';
        $scope.locationModalId = 'locationModal';

        $scope.noOfPersonList = ["It's just me - 1", "A couple - 2", "Lucky number - 3", "A pack - 4", "Give me five! - 5", "Six pack - 6", "Seven sins - 7", "Even number - 8", "Almost round - 9", "A crowd - 10"];
        $scope.selectedNoOfPersons = categoryId === 'b' ? "It's just me - 1" : "A couple - 2";
        $scope.noOfPersonsModalId = 'noOfPersonsModal';

        $scope.budgetList = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 150, 200, 250, 300, 350, 400, 450, 500];
        $scope.selectedBudget = categoryId === 'b' ? 30 : 50;
        $scope.budgetModalId = 'budgetModal';

        $scope.openModal = function (modalId) {
            $('#' + $scope[modalId]).modal({ backdrop: 'static' });
        };

        $scope.$watch(function () {
            return $scope.selectedCity;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal) {
                mixpanel.track("Location changed", { Location: newVal });
            }
        });

        $scope.$watch(function () {
            return $scope.selectedNoOfPersons;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal) {
                mixpanel.track("No of persons changed", { "No of persons": newVal });
            }
        });

        $scope.$watch(function () {
            return $scope.selectedBudget;
        }, function (newVal, oldVal) {
            if (newVal !== oldVal) {
                mixpanel.track("Budget changed", { Budget: newVal });
            }
        });
    });

    priceMetApp.controller('InputCtrl', function ($scope) {  
        $scope.getOffersButtonPushed = false;

        $scope.getOffersBtnClicked = function () {
            $scope.locationError = !$scope.location;
            $scope.noOfPersonsError = !$('.cs-select .cs-placeholder.changed').length;
            $scope.budgetError = !$scope.budget;
            $scope.getOffersButtonPushed = true;

            trackGetOfferEvent();

            var mobileScreen = $(window).width() < 720;

            if (!mobileScreen && ($scope.locationError || $scope.noOfPersonsError || $scope.budgetError))
                return false;

            $('#offerModal').modal({ backdrop: 'static' });
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

    priceMetApp.directive('selectModal', function ($timeout) {
        return {
            restrict: 'E',
            scope: {
                list: '=',
                value: '=',
                modalid: '@modalid',
                modaltitle: '@modaltitle'
            },
            templateUrl: "/templates/select-modal-template.tpl",
            link: function (scope, element) {
                scope.selectOption = function (option, $event) {
                    scope.value = option;
                    var $icon = $($event.currentTarget).find('i');
                    $icon.removeClass('fa-square-o');
                    $icon.addClass('fa-check-square-o');

                    $timeout(function () {
                        $('#' + scope.modalid).modal('hide');
                        $timeout(function () {
                            $icon.removeClass('fa-check-square-o');
                            $icon.addClass('fa-square-o');
                        }, 300);
                    }, 300);
                }
            }
        };
    });

    priceMetApp.directive('addcurrency', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {

                //format text going to user (model to view)
                ngModel.$formatters.push(function (value) {
                    return '$' + value;
                });
            }
        }
    });

    priceMetApp.directive('googleplace', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, model) {
                var options = {
                    types: ['geocode'],
                    componentRestrictions: { country: 'ca' }
                };
                scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

                google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
                    scope.$apply(function () {
                        model.$setViewValue(element.val());
                    });
                });
            }
        };
    });

    priceMetApp.filter('applyFilter', function ($filter) {
        return function () {
            var filterName = [].splice.call(arguments, 1, 1)[0];
            if (isNaN(arguments[0]))
                return arguments[0];

            return $filter(filterName).apply(null, arguments);
        };
    });

    function saveEmail(email, dateUntil) {
        var EmailObject = Parse.Object.extend("Email"),
            emailObject = new EmailObject();

        emailObject.save({
            email: email,
            dateUntil: dateUntil,
            budget: $('#inputBudget').val() || $('.mobile-input-container #selectBudget').val().match(/\d+/g)[0],
            location: $('#inputLocation').val() || $('.mobile-input-container #selectLocation').val()
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

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function getOfferCategoryName() {
        var categoryId = getParameterByName('id'),
            categoryName = 'Restaurant'; // default

        if (categoryId) {
            switch (categoryId) {
                case 'r': {
                    categoryName = 'Restaurant';
                    break;
                }
                case 'b': {
                    categoryName = 'Beauty & SPA';
                    break;
                }
                default: {
                    break;
                }
            }
        }

        return categoryName;
    }

    function getOfferCategoryId() {
        var categoryId = getParameterByName('id');

        return categoryId = categoryId || 'r';
    }

    function trackGetOfferEvent() {
        var trackObj = {
            "Category": getOfferCategoryName(),
            "No of persons": $('#selectNoOfPersons option:selected').text()
        };

        if ($(window).width() < 720) {
            trackObj.Location = $('.mobile-input-container #selectLocation').val();
            trackObj.Budget = $('.mobile-input-container #selectBudget').val().match(/\d+/g)[0];
            trackObj["No of persons"] = $('.mobile-input-container #selectNoOfPersons').val().match(/\d+/g)[0];
        }

        if ($('#inputLocation').val())
            trackObj.Location = $('#inputLocation').val();

        if ($('#inputBudget').val())
            trackObj.Budget = $('#inputBudget').val();

        mixpanel.track("Get offer", trackObj);
    }
})();