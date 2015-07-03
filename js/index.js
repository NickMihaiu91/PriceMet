(function () {

    $(document).ready(function () {

        Parse.initialize("7DSSt7Mlrm1jEb2zPwSXhzxN1PP6BFVWW3CIEyZv", "6Ax8AZUf6EcRWFKk0Vyx9Q86A9ZkE9UliOrkwm6b");

        $('.header-btn').on('click', function () {
            $('.second-section').scrollintoview({ duration: 500 });
        });

        $('.btn-get-offers').on('click', function () {
            var validInput = true,
                elementsToValidate = [$('#inputLocation'), $('#inputBudget')];

            $.each(elementsToValidate, function (index, element) {
                validInput = validateSingleElement(element) && validInput;
            });

            if (!validInput)
                return false;

            $('#offerModal').modal('show');
            removeErrorMessages();
        });

        $('.feedback-section .btn').on('click', function () {
            var feedbackText = $('.feedback-section textarea').val(),
                email = $('.feedback-section #inputContactEmail').val(),
                FeedbackObject = Parse.Object.extend("Feedback"),
                feedbackObject = new FeedbackObject(),
                validInput = true,
                elementsToValidate = [$('.feedback-section textarea'), $('.feedback-section #inputContactEmail')];

            $.each(elementsToValidate, function (index, element) {
                validInput = validateSingleElement(element) && validInput;
            });

            if (!validInput)
                return false;

            removeErrorMessages();

            feedbackObject.save({ text: feedbackText, email: email }).then(function (object) {
                swal({ title: 'Awesome!', text: 'Thank you for your feedback.', type: 'success', timer: 5000 });

                $('.feedback-section textarea').val('');
                $('.feedback-section #inputContactEmail').val('');
            });

        });

        $('.send-email').on('click', function () {
            var email = $('#offerEmail').val(),
                EmailObject = Parse.Object.extend("Email"),
                emailObject = new EmailObject();

            if (email.trim() !== '') {
                emailObject.save({ email: email }).then(function (object) { });
                $('#offerModal').modal('hide');
                setTimeout(function () {
                    swal({ title: 'Thank you!', text: "You'll get an email as soon as we launch.", type: 'success' });
                }, 500);
            }
        });

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

        function removeErrorMessages() {
            $('.has-error').removeClass('has-error');
            $('.error-message').hide();
        }

    });

})();