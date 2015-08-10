'use strict';

(function () {
    angular.module('restaurantsLookingAtRequestServiceModule', [])
        .factory('restaurantsLookingAtRequestService', function ($timeout, $interval) {

            var MAX_NUMBER_OF_RESTAURANTS_LOOKING = 3,
                MIN_NUMBER_OF_RESTAURANTS_LOOKING = 1,
                MAX_WAIT_INTERVAL = 15,
                MIN_WAIT_INTERVAL = 8,
                INTERVAL_INCREASE_RANGE = 45,
                NO_OF_RANGE_INCREASES = 3,
                NO_OF_RANGE_DECREASES = 3,
                maxNumberOfRestaurantsLooking = MAX_NUMBER_OF_RESTAURANTS_LOOKING,
                minNumberOfRestaurantsLooking = MIN_NUMBER_OF_RESTAURANTS_LOOKING,
                maxWaitInterval = MAX_WAIT_INTERVAL,
                minWaitInterval = MIN_WAIT_INTERVAL,
                noOfRangeIncreases = NO_OF_RANGE_INCREASES,
                noOfRangeDecreases = NO_OF_RANGE_DECREASES,
                waitInterval,
                intervalIncreaseRange = INTERVAL_INCREASE_RANGE,

                noOfRestaurantsLookingTimer,
                rangeNoOfRestaurantsLookingTimer,
                storedValues = {};

            var initialize = function () {

                maxNumberOfRestaurantsLooking = MAX_NUMBER_OF_RESTAURANTS_LOOKING;
                minNumberOfRestaurantsLooking = MIN_NUMBER_OF_RESTAURANTS_LOOKING;
                maxWaitInterval = MAX_WAIT_INTERVAL;
                minWaitInterval = MIN_WAIT_INTERVAL;
                intervalIncreaseRange = INTERVAL_INCREASE_RANGE;
                noOfRangeIncreases = NO_OF_RANGE_INCREASES;
                noOfRangeDecreases = NO_OF_RANGE_DECREASES;

                if (noOfRestaurantsLookingTimer)
                    $timeout.cancel(noOfRestaurantsLookingTimer);

                if (rangeNoOfRestaurantsLookingTimer) 
                    $timeout.cancel(rangeNoOfRestaurantsLookingTimer);

                var changeNoOfRestaurantsLooking = function () {
                    storedValues.noOfRestaurantsWatchingBid = randomIntFromInterval(minNumberOfRestaurantsLooking, maxNumberOfRestaurantsLooking);
                    waitInterval = randomIntFromInterval(minWaitInterval, maxWaitInterval);
                    noOfRestaurantsLookingTimer = $timeout(function () {
                        changeNoOfRestaurantsLooking();
                    }, waitInterval * 1000);
                },

                    changeRangeNoOfRestaurantsLooking = function () {
                        rangeNoOfRestaurantsLookingTimer = $timeout(function () {
                            if (noOfRangeIncreases > 0) {
                                minNumberOfRestaurantsLooking *= 2;
                                maxNumberOfRestaurantsLooking *= 2;
                                noOfRangeIncreases--;
                            }
                            else
                                if (noOfRangeDecreases > 0) {
                                    minNumberOfRestaurantsLooking /= 2;
                                    maxNumberOfRestaurantsLooking /= 2;
                                    noOfRangeDecreases--;
                                }
                               
                            changeRangeNoOfRestaurantsLooking();
                        }, intervalIncreaseRange * 1000);
                    };

                changeNoOfRestaurantsLooking();
                changeRangeNoOfRestaurantsLooking();

                return storedValues.noOfRestaurantsWatchingBid;
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