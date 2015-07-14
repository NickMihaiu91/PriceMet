(function () {

    var canadaCitiesList = ["Vancouver", "Burnaby", "Coquitlam", "Delta", "Langley", "Lions Bay", "Maple Ridge", "New Westminster", "North Vancouver", "Pitt Meadows", "Port Coquitlam", "Port Moody", "Richmond", "Surrey", "West Vancouver", "White Rock"];

    $(document).ready(function () { 
        $("#inputLocation").typeahead({ source: canadaCitiesList });

        addLocationOptionsToMobileDropdown();
    });

    function addLocationOptionsToMobileDropdown() {
        var select = $('#selectLocation');

        $.each(canadaCitiesList, function (index, element) {
            var option = new Option(element, index);
            select.append($(option));
        });
    }

})();