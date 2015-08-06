'use strict';

(function () {
    angular.module('offersServiceModule', [])
        .factory('offersService', function ($http) {

            var offers = [];

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
})();