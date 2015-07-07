(function () {

    $(document).ready(function () {

        Parse.initialize("rABaK3FXscnhAej5m3WNT8jQuaEHiFpwCAcGgEbv", "QkE1Q8Nsb6Fy8GkeKBJNmNidxzV2g8TIKprOEKOe");

        setTimeout(function () {
            mixpanel.track("Page viewed");
        }, 500);

        $('.header-btn').on('click', function () {
            $('.second-section').scrollintoview({ duration: 500 });
            mixpanel.track("Header button push");
        });

        $('.btn-get-offers').on('click', function () {
            var validInput = true,
                elementsToValidate = [$('#inputLocation'), $('#inputBudget')],
                trackObj = { "Category": $('#selectOfferType option:selected').text() };

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

            $('#offerModal').modal('show');
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

        $('.send-email').on('click', function () {
            var email = $('#offerEmail').val(),
                EmailObject = Parse.Object.extend("Email"),
                emailObject = new EmailObject(),
                trackObj = {};

            if (email.trim() !== '')
                trackObj.Email = email;

            mixpanel.track("Send email", trackObj);

            if (email.trim() !== '') {
                emailObject.save({ email: email }).then(function (object) { });
                $('#offerModal').modal('hide');
                setTimeout(function () {
                    swal({ title: 'Thank you!', text: "You'll get an email as soon as we launch.", type: 'success' });
                }, 500);
            }
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

        $("select").change(function () {
            var trackObj = { "Category": $('#selectOfferType option:selected').text() };

            mixpanel.track("Category changed", trackObj);
        });

        $('#offerEmail').focusout(function () {
            var trackObj = {},
                email = $('#offerEmail').val();

            if (email)
                trackObj.Email = email;

            mixpanel.track("Email changed", trackObj);
        });

        $(".logo").on('click', function () {
            mixpanel.track("Logo clicked");
        });

        $(window).bind('beforeunload', function () {
            var trackObj = {
                "Category": $('#selectOfferType option:selected').text(),
                "Location": $('#inputLocation').val(),
                "Budget": $('#inputBudget').val(),
                "Email": $('#offerEmail').val(),
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

    });

})();