'use strict';

(function () {
    angular.module('offersServiceModule', [])
        .factory('offersService', function ($timeout) {

            var offers = [],
                INITIAL_WAIT_INTERVAL = 0,
                MAX_WAIT_INTERVAL = 20,
                MIN_WAIT_INTERVAL = 10,
                INCREASE_WAIT_INTERVAL_AFTER_NO_OF_OFFERS = 6,
                MAX_OFFER_VALUE = 50,
                maxWaitInterval,
                minWaitInterval,
                storedValues = {},
                showMoreOffersTimer,
                initialOfferTimer;

            var getOffers = function (budget, noOfPersons, offerType, callback) {
                budget = budget / noOfPersons;

                var lowerQuery = new Parse.Query('Offer');
                lowerQuery.equalTo("bidRequest", Math.floor(budget / 5) * 5);
                lowerQuery.equalTo("offerType", offerType);

                var higherQuery = new Parse.Query('Offer');
                higherQuery.equalTo("bidRequest", Math.floor(budget / 5 + 1) * 5);
                higherQuery.equalTo("offerType", offerType);

                var mainQuery = Parse.Query.or(lowerQuery, higherQuery);

                if (budget > MAX_OFFER_VALUE) {
                    mainQuery = new Parse.Query('Offer');
                    mainQuery.equalTo("bidRequest", MAX_OFFER_VALUE);
                    mainQuery.equalTo("offerType", offerType);
                }

                mainQuery.find({
                    success: function (results) {
                        // results is an array of Parse.Object.
                        offers = formatOffers(results, noOfPersons, offerType);
                        //shuffle(offers);
                        callback(offers);
                        //initializeFlow();
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
                storedValues.limitTo = 5;

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

            var getOfferById = function (id, noOfPersons, callback) {
                var query = new Parse.Query('Offer');
                query.get(id, {
                    success: function (offer) {
                        // The object was retrieved successfully.
                        callback(formatOffers([offer], noOfPersons, offer.attributes.offerType)[0]);
                    },
                    error: function (object, error) {
                        // The object was not retrieved successfully.
                        // error is a Parse.Error with an error code and message.
                        console.log('Error retrieving object', error);
                    }
                });
            };

            var service = {
                getOffers: getOffers,
                addOffer: addOffer,
                getOfferById: getOfferById,
                stopShowingMoreOffers: stopShowingMoreOffers,
                storedValues: storedValues
            };

            return service;
        });


    function formatOffers(parseOfferList, noOfPersons, offerType) {
        var offers = [],
            baseUrlToImg = 'images/offers/',
            imgDefaultExtension = '.jpg',
            RESTAURANT_IMAGE_ID = 'R',
            RESTAURANT_PATH = 'restaurant/',
            BEAUTY_PATH = 'beauty/',
            BEAUTY_IMAGE_ID = 'B',
            urlToImg = offerType === 'r' ? baseUrlToImg + RESTAURANT_PATH + RESTAURANT_IMAGE_ID : baseUrlToImg + BEAUTY_PATH + BEAUTY_IMAGE_ID,
            RATING_MIN = 3,
            RATING_MAX = 5,
            VOTES_MIN = 50,
            VOTES_MAX = 200;

        angular.forEach(parseOfferList, function (value) {
            offers.push({
                id: value.id,
                bidOfferTitle: formatBidOfferTitle(value.attributes.bidOfferTitle, value.attributes.offerPrice, value.attributes.originalPrice, noOfPersons),
                offerPrice: value.attributes.offerPrice * noOfPersons,
                originalPrice: value.attributes.originalPrice * noOfPersons,
                imgUrl: urlToImg + value.attributes.imageID + imgDefaultExtension,
                distance: value.attributes.distance,
                rating: randomIntFromInterval(RATING_MIN, RATING_MAX),
                votes: randomIntFromInterval(VOTES_MIN, VOTES_MAX)
            });
        });
        
        return offers;
    }

    function formatBidOfferTitle(bidOfferTitle, offerPrice, originalPrice, noOfPersons) {
        if(noOfPersons == 1)
            return bidOfferTitle;

        var offerPriceRegex = new RegExp('[$]' + offerPrice + '((?:\s)|(?:\:)|[^0-9])'),
            offerTitleEnding = ' - for ';

        bidOfferTitle = bidOfferTitle.replace(originalPrice, originalPrice * noOfPersons);
        bidOfferTitle = bidOfferTitle.replace(offerPriceRegex, '*' + offerPrice * noOfPersons + '#');
        bidOfferTitle = bidOfferTitle.replace('*', '$');
        bidOfferTitle = bidOfferTitle.replace('#', ' ');

        return bidOfferTitle + offerTitleEnding + formatNoOfPersonsToTextRepresentation(noOfPersons);
    }

    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function formatNoOfPersonsToTextRepresentation(noOfPersons) {
        var textValues = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        return textValues[noOfPersons];
    }

    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
})();