(function () {

    var canadaCitiesList = ["Vancouver", "Richmond", "Coquitlam", "Port Coquitlam", "North Vancouver", "Burnaby", "Delta", "Langley", "Lions Bay", "Maple Ridge", "New Westminster", "Pitt Meadows", "Port Moody", "Surrey", "West Vancouver", "White Rock"];

    $(document).ready(function () { 
        $("#inputLocation").typeahead({ source: canadaCitiesList });
    });

})();