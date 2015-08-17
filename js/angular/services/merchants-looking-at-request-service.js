'use strict';

(function () {
    angular.module('merchantsLookingAtRequestServiceModule', [])
        .factory('merchantsLookingAtRequestService', function ($timeout, $interval) {

            var MAX_NUMBER_OF_MERCHANTS_LOOKING = 3,
                MIN_NUMBER_OF_MERCHANTS_LOOKING = 1,
                MAX_WAIT_INTERVAL = 15,
                MIN_WAIT_INTERVAL = 8,
                INTERVAL_INCREASE_RANGE = 45,
                NO_OF_RANGE_INCREASES = 3,
                NO_OF_RANGE_DECREASES = 3,
                maxNumberOfMerchantsLooking = MAX_NUMBER_OF_MERCHANTS_LOOKING,
                minNumberOfMerchantsLooking = MIN_NUMBER_OF_MERCHANTS_LOOKING,
                maxWaitInterval = MAX_WAIT_INTERVAL,
                minWaitInterval = MIN_WAIT_INTERVAL,
                noOfRangeIncreases = NO_OF_RANGE_INCREASES,
                noOfRangeDecreases = NO_OF_RANGE_DECREASES,
                waitInterval,
                intervalIncreaseRange = INTERVAL_INCREASE_RANGE,

                noOfMerchantsLookingTimer,
                rangeNoOfMerchantsLookingTimer,
                storedValues = {};

            var initialize = function () {

                maxNumberOfMerchantsLooking = MAX_NUMBER_OF_MERCHANTS_LOOKING;
                minNumberOfMerchantsLooking = MIN_NUMBER_OF_MERCHANTS_LOOKING;
                maxWaitInterval = MAX_WAIT_INTERVAL;
                minWaitInterval = MIN_WAIT_INTERVAL;
                intervalIncreaseRange = INTERVAL_INCREASE_RANGE;
                noOfRangeIncreases = NO_OF_RANGE_INCREASES;
                noOfRangeDecreases = NO_OF_RANGE_DECREASES;

                if (noOfMerchantsLookingTimer)
                    $timeout.cancel(noOfMerchantsLookingTimer);

                if (rangeNoOfMerchantsLookingTimer) 
                    $timeout.cancel(rangeNoOfMerchantsLookingTimer);

                var changeNoOfRestaurantsLooking = function () {
                    storedValues.noOfMerchantsWatchingBid = randomIntFromInterval(minNumberOfMerchantsLooking, maxNumberOfMerchantsLooking);
                    waitInterval = randomIntFromInterval(minWaitInterval, maxWaitInterval);
                    noOfMerchantsLookingTimer = $timeout(function () {
                        changeNoOfRestaurantsLooking();
                    }, waitInterval * 1000);
                },

                    changeRangeNoOfRestaurantsLooking = function () {
                        rangeNoOfMerchantsLookingTimer = $timeout(function () {
                            if (noOfRangeIncreases > 0) {
                                minNumberOfMerchantsLooking *= 2;
                                maxNumberOfMerchantsLooking *= 2;
                                noOfRangeIncreases--;
                            }
                            else
                                if (noOfRangeDecreases > 0) {
                                    minNumberOfMerchantsLooking /= 2;
                                    maxNumberOfMerchantsLooking /= 2;
                                    noOfRangeDecreases--;
                                }
                               
                            changeRangeNoOfRestaurantsLooking();
                        }, intervalIncreaseRange * 1000);
                    };

                changeNoOfRestaurantsLooking();
                changeRangeNoOfRestaurantsLooking();

                return storedValues.noOfMerchantsWatchingBid;
            };

            var service = {
                initialize: initialize,
                storedValues: storedValues
            };

            return service;
        });

    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
})();