'use strict';

(function () {
    angular.module('offersServiceModule', [])
        .factory('offersService', function ($http) {

            var offers = [];

            var getOffers = function (budget, callback) {
                var lowerQuery = new Parse.Query('Offer');
                lowerQuery.equalTo("bidRequest", Math.floor(budget / 5) * 5);

                var higherQuery = new Parse.Query('Offer');
                higherQuery.equalTo("bidRequest", Math.floor(budget / 5 + 1) * 5);

                var mainQuery = Parse.Query.or(lowerQuery, higherQuery);

                mainQuery.find({
                    success: function (results) {
                        // results is an array of Parse.Object.
                        offers = formatOffers(results);
                        callback(offers);
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

            var service = {
                getOffers: getOffers,
                addOffer: addOffer
            };

            return service;
        });


    function formatOffers(parseOfferList) {
        var offers = [],
            urlToImg = 'images/offers/',
            imgDefaultExtension = '.jpg',
            MAX_DISTANCE = 15;

        angular.forEach(parseOfferList, function (value) {
            offers.push({
                bidOfferTitle: value.attributes.bidOfferTitle,
                offerPrice: value.attributes.offerPrice,
                originalPrice: value.attributes.originalPrice,
                imgUrl: urlToImg + value.attributes.imageID + imgDefaultExtension,
                distance: Math.floor(Math.random() * MAX_DISTANCE) + 1
            });
        });

        return offers;
    }
})();