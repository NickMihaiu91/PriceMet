'use strict';

(function () {
    angular.module('offersServiceModule', [])
        .factory('offersService', function ($timeout) {

            var offers = [],
                INITIAL_WAIT_INTERVAL = 5,
                MAX_WAIT_INTERVAL = 20,
                MIN_WAIT_INTERVAL = 10,
                INCREASE_WAIT_INTERVAL_AFTER_NO_OF_OFFERS = 6,
                maxWaitInterval,
                minWaitInterval,
                storedValues = {},
                showMoreOffersTimer,
                initialOfferTimer;

            var getOffers = function (budget, noOfPersons, callback) {
                budget = budget / noOfPersons;

                var lowerQuery = new Parse.Query('Offer');
                lowerQuery.equalTo("bidRequest", Math.floor(budget / 5) * 5);

                var higherQuery = new Parse.Query('Offer');
                higherQuery.equalTo("bidRequest", Math.floor(budget / 5 + 1) * 5);

                var mainQuery = Parse.Query.or(lowerQuery, higherQuery);

                mainQuery.find({
                    success: function (results) {
                        // results is an array of Parse.Object.
                        offers = formatOffers(results, noOfPersons);
                        callback(offers);
                        initializeFlow();
                    },

                    error: function (error) {
                        // error is an instance of Parse.Error.
                        console.log('Error', error);
                    }
                });
            };

            var addOffer = function (offer) {
                if (offer)
                    offers.push(offer);
            };

            var initializeFlow = function () {
                var showMoreOffersAtInterval = function () {
                    if (storedValues.limitTo >= offers.length)
                        return;

                    if (storedValues.limitTo === INCREASE_WAIT_INTERVAL_AFTER_NO_OF_OFFERS) {
                        minWaitInterval *= 3;
                        maxWaitInterval *= 3;
                    }

                    var waitTime = randomIntFromInterval(minWaitInterval, maxWaitInterval);
                    showMoreOffersTimer = $timeout(function () {
                        storedValues.limitTo++;
                        showMoreOffersAtInterval();
                    }, waitTime * 1000);
                };

                minWaitInterval = MIN_WAIT_INTERVAL;
                maxWaitInterval = MAX_WAIT_INTERVAL;
                storedValues.limitTo = 0;

                if (initialOfferTimer)
                    $timeout.cancel(initialOfferTimer);

                if (showMoreOffersTimer)
                    $timeout.cancel(showMoreOffersTimer);

                initialOfferTimer = $timeout(function () {
                    if (!offers.length)
                        return;

                    storedValues.limitTo++;
                    showMoreOffersAtInterval();
                }, INITIAL_WAIT_INTERVAL * 1000);
            };

            var stopShowingMoreOffers = function () {
                $timeout.cancel(showMoreOffersTimer);
            };

            var service = {
                getOffers: getOffers,
                addOffer: addOffer,
                stopShowingMoreOffers: stopShowingMoreOffers,
                storedValues: storedValues
            };

            return service;
        });


    function formatOffers(parseOfferList, noOfPersons) {
        var offers = [],
            urlToImg = 'images/offers/',
            imgDefaultExtension = '.jpg';

        angular.forEach(parseOfferList, function (value) {
            offers.push({
                bidOfferTitle: formatBidOfferTitle(value.attributes.bidOfferTitle, value.attributes.offerPrice, value.attributes.originalPrice, noOfPersons),
                offerPrice: value.attributes.offerPrice * noOfPersons,
                originalPrice: value.attributes.originalPrice * noOfPersons,
                imgUrl: urlToImg + value.attributes.imageID + imgDefaultExtension,
                distance: value.attributes.distance
            });
        });
        
        return offers;
    }

    function formatBidOfferTitle(bidOfferTitle, offerPrice, originalPrice, noOfPersons) {
        if(noOfPersons === 1)
            return bidOfferTitle;

        bidOfferTitle = bidOfferTitle.replace(originalPrice, originalPrice * noOfPersons);
        bidOfferTitle = bidOfferTitle.replace(offerPrice, offerPrice * noOfPersons);

        return bidOfferTitle;
    }

    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
})();