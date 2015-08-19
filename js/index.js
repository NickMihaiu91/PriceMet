(function () {

    $(document).ready(function () {

        Parse.initialize("rABaK3FXscnhAej5m3WNT8jQuaEHiFpwCAcGgEbv", "QkE1Q8Nsb6Fy8GkeKBJNmNidxzV2g8TIKprOEKOe");

        setTimeout(function () {
            mixpanel.track("Page viewed");
        }, 500);

        displayContentBasedOnQueryParameter();
        bindEvents();
    });

    function bindEvents() {
        var askedForLocationAccess = false;

        $('.btn-header').on('click touchstart', function () {
            $('.second-section').scrollintoview({ duration: 500 });
            mixpanel.track("Header button push");
        });

        $('.btn-get-offers').on('click touchstart', function () {
            var validInput = true,
                elementsToValidate = [$('#inputLocation'), $('#inputBudget')],
                trackObj = {
                    "Category": $('#selectOfferType option:selected').text(),
                    "No of persons": $('#selectNoOfPersons option:selected').text()
                };

            if ($(window).width() < 768) {
                elementsToValidate = [];
                trackObj.Location = $('#selectLocation option:selected').text();
                trackObj.Budget = $('#selectBudget option:selected').text();
            }

            if ($('#inputLocation').val())
                trackObj.Location = $('#inputLocation').val();

            if ($('#inputBudget').val())
                trackObj.Budget = $('#inputBudget').val();

            mixpanel.track("Get offer", trackObj);

            clearErrorMessages();

            $.each(elementsToValidate, function (index, element) {
                validInput = validateSingleElement(element) && validInput;
            });

            if (!validInput)
                return false;

            $('#offerModal').modal({ backdrop: 'static' });
        });

        $('.feedback-section .btn').on('click', function () {
            var feedbackText = $('.feedback-section textarea').val(),
                email = $('.feedback-section #inputContactEmail').val(),
                FeedbackObject = Parse.Object.extend("Feedback"),
                feedbackObject = new FeedbackObject(),
                validInput = true,
                elementsToValidate = [$('.feedback-section textarea'), $('.feedback-section #inputContactEmail')],
                trackObj = {};

            if (feedbackText)
                trackObj.Feedback = feedbackText;

            if (email)
                trackObj.Email = email;

            mixpanel.track("Send feedback", trackObj);

            clearErrorMessages();

            $.each(elementsToValidate, function (index, element) {
                validInput = validateSingleElement(element) && validInput;
            });

            if (!validInput)
                return false;

            feedbackObject.save({ text: feedbackText, email: email }).then(function (object) {
                swal({ title: 'Awesome!', text: 'Thank you for your feedback.', type: 'success', timer: 5000 });

                $('.feedback-section textarea').val('');
                $('.feedback-section #inputContactEmail').val('');
            });

        });

        $('#inputLocation').on('focus', function () {
            if (navigator.geolocation && !askedForLocationAccess) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var geolocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                        geocoder = new google.maps.Geocoder();

                    geocoder.geocode({
                        "latLng": geolocation
                    }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK)
                            $('#inputLocation').val(results[0].formatted_address);
                    });

                    askedForLocationAccess = true;
                });
            }
        });

        $('.navbar-nav .nav-log-in').on('click', function () {
            setTimeout(function () {
                swal({ title: 'Oops', text: 'There seems to be a problem. Please try again later, we are very sorry.', type: 'error' });
            }, 2000);
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", {'option': 'log in'});
        });

        $('.navbar-nav .nav-contact-us').on('click', function () {
            $('.third-section').scrollintoview({ duration: 500 });
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", { 'option': 'contact us' });
        });

        $('.navbar-nav .nav-help').on('click', function () {
            $('footer').scrollintoview({ duration: 500 });
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", { 'option': 'help' });
        });

        // element events for event tracking
        $('#inputLocation').focusout(function () {
            var trackObj = {},
                inputLocationValue = $('#inputLocation').val();

            if (inputLocationValue)
                trackObj.Location = inputLocationValue;

            mixpanel.track("Location changed", trackObj);
        });

        $('#inputBudget').focusout(function () {
            var trackObj = {},
                inputBudgetValue = $('#inputBudget').val();

            if (inputBudgetValue)
                trackObj.Budget = inputBudgetValue;

            mixpanel.track("Budget changed", trackObj);
        });

        $("#selectOfferType").change(function () {
            var trackObj = { "Category": $('#selectOfferType option:selected').text() };

            mixpanel.track("Category changed", trackObj);
        });

        $("#selectNoOfPersons").change(function () {
            var trackObj = { "No of persons": $('#selectNoOfPersons option:selected').text() };

            mixpanel.track("No of persons changed", trackObj);
        });

        $('.offer-container .accept-bid').on('click', function () {
            mixpanel.track("Accept bid");
        });

        $(".logo").on('click', function () {
            mixpanel.track("Logo clicked");
        });

        $(".navbar-toggle").on('click', function () {
            mixpanel.track("Navbar toggle clicked");
        });

        $("footer .fa-facebook").on('click', function () {
            mixpanel.track("Footer", { 'social button clicked': 'facebook'});
        });

        $("footer .fa-twitter").on('click', function () {
            mixpanel.track("Footer", { 'social button clicked': 'twitter' });
        });

        $("footer .fa-google-plus").on('click', function () {
            mixpanel.track("Footer", { 'social button clicked': 'google' });
        });

        $("footer .fa-pinterest").on('click', function () {
            mixpanel.track("Footer", { 'social button clicked': 'pinterest' });
        });

        $("footer .fa-instagram").on('click', function () {
            mixpanel.track("Footer", { 'social button clicked': 'instagram' });
        });

        $(window).bind('beforeunload', function () {
            var trackObj = {
                "Category": $('#selectOfferType option:selected').text(),
                "Location": $('#inputLocation').val(),
                "Budget": $('#inputBudget').val(),
                "No of persons": $('#selectNoOfPersons option:selected').text(),
                "Feedback": $('.feedback-section textarea').val(),
                "Feedback email": $('.feedback-section #inputContactEmail').val()
            };

            mixpanel.track("Page closed", trackObj);
        });

        // track where on the page they get too
        var offerSectionViewed = false,
            contactUsSectionViewed = false,
            footerViewed = false;

        $('.second-section h1').appear();
        $('.third-section h1').appear();
        $('footer').appear();

        $('.second-section h1').on('appear', function () {
            if (!offerSectionViewed)
                mixpanel.track("Viewed Offer section");

            offerSectionViewed = true;
        });

        $('.third-section h1').on('appear', function () {
            if (!contactUsSectionViewed)
                mixpanel.track("Viewed Contact us section");

            contactUsSectionViewed = true;
        });

        $('footer').on('appear', function () {
            if (!footerViewed)
                mixpanel.track("Viewed footer");

            footerViewed = true;
        });
    }

    function displayContentBasedOnQueryParameter() {
        var category = getParameterByName('id'),
            messages = {
                'default': {
                    firstSectionH1: 'Find the best places that meet your price',
                    firstSectionH3: 'Set your budget and let local vendors compete with their offers',
                    secondSectionH1: 'Name your price and let vendors compete!'
                },
                'r': {
                    firstSectionH1: 'Amazing restaurants that meet your price',
                    firstSectionH3: 'Set your budget and let local restaurants compete with their offers',
                    secondSectionH1: 'Pick your own price and let restaurants show their offers!'
                },
                'cb': {
                    firstSectionH1: 'Great fun at your own price',
                    firstSectionH3: 'Set your budget and let clubs and bars compete with their offers',
                    secondSectionH1: 'Pick your own price and let clubs and bars show their offers!'
                },
                'b': {
                    firstSectionH1: 'Local health and beauty salons that meet your price',
                    firstSectionH3: 'Set your budget and let salons compete with their offers',
                    secondSectionH1: 'Pick your own price and let salons show their offers!'
                },
                'p': {
                    firstSectionH1: 'Local plumbers ready to meet your price',
                    firstSectionH3: 'Set your budget and let the plumbers bid in minutes',
                    secondSectionH1: 'Pick your own price and let plumbers show their offers!'
                },
                'ac': {
                    firstSectionH1: 'A/C professionals ready to meet your price',
                    firstSectionH3: 'Set your budget and let them bid in minutes',
                    secondSectionH1: 'Pick your own price and let A/C professional show their offers!'
                },
                'ar': {
                    firstSectionH1: 'Trusted auto mechanics ready to meet your price',
                    firstSectionH3: 'Set your budget and let them bid in minutes',
                    secondSectionH1: 'Pick your own price and let auto mechanics show their offers!'
                }
            };

        if (category && messages[category]) {
            $('.first-section h1').text(messages[category].firstSectionH1);
            $('.first-section h3').text(messages[category].firstSectionH3);
            $('.second-section h1').text(messages[category].secondSectionH1);

            $("#selectOfferType").val(category);

            switch (category) {
                case 'r': {
                    $('section.first-section').addClass('restaurant');
                    break;
                }
                case 'cb': {
                    $('section.first-section').addClass('clubs-bars');
                    break;
                }
                case 'b': {
                    $('section.first-section').addClass('beauty-spa');
                    break;
                }
                case 'p': {
                    $('section.first-section').addClass('plumbing');
                    break;
                }
                case 'ac': {
                    $('section.first-section').addClass('air-conditioning');
                    break;
                }
                case 'ar': {
                    $('section.first-section').addClass('auto-repair');
                    break;
                }
                default: {
                    break;
                }
            }
        }
        else {
            $('.first-section h1').text(messages['default'].firstSectionH1);
            $('.first-section h3').text(messages['default'].firstSectionH3);
            $('.second-section h1').text(messages['default'].secondSectionH1);

            $('section.first-section').addClass('default');
        }
    }

    // auxiliar functions
    function validateSingleElement($element) {
        if (!$element)
            return false;

        if ($element.val().trim() === '') {
            $element.parent().addClass('has-error');
            $element.parent().siblings(".error-message").show();

            return false;
        }

        return true;
    }

    function clearErrorMessages() {
        $('.has-error').removeClass('has-error');
        $('.error-message').hide();
    }

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    String.prototype.format = function () {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{' + i + '\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };
})();