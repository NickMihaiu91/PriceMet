(function () {

    $(document).ready(function () {

        Parse.initialize("rABaK3FXscnhAej5m3WNT8jQuaEHiFpwCAcGgEbv", "QkE1Q8Nsb6Fy8GkeKBJNmNidxzV2g8TIKprOEKOe");

        setTimeout(function () {
            mixpanel.track("Page viewed");
        }, 500);

        displayContentBasedOnQueryParameter();
        initializeCustomSelect();
        handleCustomInput();
        handleOlderBrowsers();
        bindEvents();
    });

    function bindEvents() {
        var askedForLocationAccess = false;

        $('.feedback-section .send-feedback').on('click', function () {
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
                            $('#inputLocation').trigger('input');
                    });

                    askedForLocationAccess = true;
                });
            }
        });

        $('.cs-options ul').on('click touchstart', function () {
            $('.cs-placeholder').addClass('changed');
        });

        $('.navbar-nav .nav-log-in').on('click', function () {
            setTimeout(function () {
                swal({ title: 'Oops', text: 'There seems to be a problem. Please try again later, we are very sorry.', type: 'error' });
            }, 2000);
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", {'option': 'log in'});
        });

        $('.navbar-nav .nav-sign-up').on('click', function () {
            setTimeout(function () {
                swal({ title: 'Oops', text: 'There seems to be a problem. Please try again later, we are very sorry.', type: 'error' });
            }, 2000);
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", { 'option': 'sign up' });
        });

        $('.navbar-nav .nav-how-it-works').on('click', function () {
            $('.how-it-works').scrollintoview({ duration: 500 });
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", { 'option': 'how it works' });
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

        $("#selectNoOfPersons").change(function () {
            var trackObj = { "No of persons": $('#selectNoOfPersons option:selected').text() };

            mixpanel.track("No of persons changed", trackObj);
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
                "Category": getOfferCategoryName(),
                "Location": $('#inputLocation').val(),
                "Budget": $('#inputBudget').val(),
                "No of persons": $('#selectNoOfPersons option:selected').text(),
                "Feedback": $('.feedback-section textarea').val(),
                "Feedback email": $('.feedback-section #inputContactEmail').val()
            };

            mixpanel.track("Page closed", trackObj);
        });

        // track where on the page they get too
        var whyPricemetSectionViewed = false,
            howItWorksSectionViewed = false,
            benefitsSectionViewed = false,
            contactUsSectionViewed = false,
            footerViewed = false;

        $('.why-pricemet h1').appear();
        $('.how-it-works h1').appear();
        $('.feedback-section h1').appear();
        $('.benefits h1:first').appear();
        $('footer').appear();

        $('.why-pricemet h1').on('appear', function () {
            if (!whyPricemetSectionViewed)
                mixpanel.track("Viewed Why Pricemet section");

            whyPricemetSectionViewed = true;
        });

        $('.how-it-works h1').on('appear', function () {
            if (!howItWorksSectionViewed)
                mixpanel.track("Viewed How it works section");

            howItWorksSectionViewed = true;
        });

        $('.benefits h1:first').on('appear', function () {
            if (!benefitsSectionViewed)
                mixpanel.track("Viewed Benefits section");

            benefitsSectionViewed = true;
        });

        $('.feedback-section h1').on('appear', function () {
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
                    firstSectionTitle: 'Name your own price at restaurants',
                    firstSectionBellowTitle: 'We notify the restaurants. You get the best offers for your money.',
                    secondSectionH1: 'Pick your own price and let restaurants show their offers!',
                    whyPricemetText1: 'Because we help you find great food at the price, YOU choose, not the price someone else chooses for you.',
                    whyPricemetText2: 'When YOU name your own price, you save up to 80% below the regular restaurant prices.',
                    howItWorksStep2Title: 'We notify local restaurants',
                    howItWorksStep2Text: 'Your request is automatically sent to our network of restaurants',
                    howItWorksImgUrl: 'images/Why-PriceMet_Restaurants.png',
                    benefitsSection: {
                        title1: 'The power is in your hands',
                        text1: "You say how much you are willing to pay for your meal. Not the restaurants! Using PriceMet's proprietary auction system restaurants will compete for your money so that you get more bang for your buck!",
                        title2: 'Make your friends jealous',
                        text2: "Find local popular restaurants as well as area's hidden gems without lifting a finger. Get to know top eating places that your friends and family might not know about.",
                        title3: 'Experience more',
                        text3: "A great variety of restaurants putting their best offers to your request. You'll discover cuisines that will make you fall to your knees... Rest assured, you'll always find something on your taste!"
                    }
                },
                'b': {
                    firstSectionH1: 'Local health and beauty salons that meet your price',
                    firstSectionH3: 'Set your budget and let salons compete with their offers',
                    firstSectionTitle: 'Name your own price at spa & beauty salons',
                    firstSectionBellowTitle: 'We notify the merchants. You get the best offers for your money.',
                    secondSectionH1: 'Pick your own price and let salons show their offers!',
                    whyPricemetText1: 'Because we help you find the best spas and salons the city has to offer at the price, YOU choose, not the price someone else chooses for you.',
                    whyPricemetText2: 'When YOU name your own price, you save up to 80% below the regular prices.',
                    howItWorksStep2Title: 'We notify local health & beauty salons',
                    howItWorksStep2Text: 'Your request is automatically sent to our network of health & beauty salons',
                    howItWorksImgUrl: 'images/Why-PriceMet_Health-and-Beauty.png',
                    benefitsSection: {
                        title1: 'You set the price',
                        text1: "Say how much are you willing to pay for your health or beauty service. You are now in control! Not the spas or salons! Using PriceMet's proprietary auction system, salons and spas will compete for your money so that you get more bang for your buck!",
                        title2: 'Discover great local services',
                        text2: "Find local names-you-know spas and salons as well as area's hidden gems in your neighborhood and get pampered. Get to experience an amazing massage, that perfect blowout or just a gorgeous place to relax and chill out in your corner of the city.",
                        title3: 'Experience more',
                        text3: "With our large network of salons you will discover a wide variety of health and beauty services and products to suit your needs and soothe your soul... Rest assured, you'll always find something on your taste!"
                    }
                },
                'cb': {
                    firstSectionH1: 'Great fun at your own price',
                    firstSectionH3: 'Set your budget and let clubs and bars compete with their offers',
                    secondSectionH1: 'Pick your own price and let clubs and bars show their offers!'
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
            $('.first-section .title h2').text(messages[category].firstSectionTitle);
            $('.first-section .title h4').text(messages[category].firstSectionBellowTitle);
            $('.first-section .mobile-input-container .image-explanation h2').text(messages[category].firstSectionTitle);
            $('.first-section .mobile-input-container .image-explanation h4').text(messages[category].firstSectionBellowTitle);
            $('.why-pricemet .text-container p:nth-of-type(1)').text(messages[category].whyPricemetText1);
            $('.why-pricemet .text-container p:nth-of-type(2)').text(messages[category].whyPricemetText2);
            $('.why-pricemet img').attr('src', (messages[category].howItWorksImgUrl));

            $('.how-it-works .box:nth-of-type(2) .title > h3').text(messages[category].howItWorksStep2Title);
            $('.how-it-works .box:nth-of-type(2) .description > p').text(messages[category].howItWorksStep2Text);

            for (var i = 0; i <= 2; i++) {
                $('.benefits  .text-container:eq(' + i + ') h1').text(messages[category].benefitsSection['title' + (i + 1)]);
                $('.benefits  .text-container:eq(' + i + ') p').text(messages[category].benefitsSection['text' + (i + 1)]);
            }

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
            $('section.first-section').addClass('default');
        }
    }

    function initializeCustomSelect() {
        [].slice.call(document.querySelectorAll('select.cs-select')).forEach(function (el) {
            new SelectFx(el);
            window.loading_screen.finish();
        });
    }

    function handleCustomInput() {
        // trim polyfill : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
        if (!String.prototype.trim) {
            (function () {
                // Make sure we trim BOM and NBSP
                var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
                String.prototype.trim = function () {
                    return this.replace(rtrim, '');
                };
            })();
        }

        [].slice.call(document.querySelectorAll('input.input__field')).forEach(function (inputEl) {
            // in case the input is already filled..
            if (inputEl.value.trim() !== '') {
                classie.add(inputEl.parentNode, 'input--filled');
            }

            // events:
            inputEl.addEventListener('focus', onInputFocus);
            inputEl.addEventListener('blur', onInputBlur);
        });

        function onInputFocus(ev) {
            classie.add(ev.target.parentNode, 'input--filled');
        }

        function onInputBlur(ev) {
            if (ev.target.value.trim() === '') {
                classie.remove(ev.target.parentNode, 'input--filled');
            }
        }
    }

    function handleOlderBrowsers() {
        androidVersion = parseFloat(getAndroidVersion());

        if (androidVersion < 4.4) {
            $('.mobile-input-container .input-span').addClass('legacy-input');
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
    };

    function getAndroidVersion(ua) {
        ua = (ua || navigator.userAgent).toLowerCase();
        var match = ua.match(/android\s([0-9\.]*)/);
        return match ? match[1] : false;
    };

    String.prototype.format = function () {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{' + i + '\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };
})();