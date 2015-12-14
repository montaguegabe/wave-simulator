$(document).ready(function() {

    $('#view-3d').focus();
    $("#equation").val(equationString);

    $("#toggleRealistic").click(function(){
        realistic = !realistic;
        $("#view-3d").empty();
        initRendering();
    });


    $("#setFunction").click(function(){
        equationString = $("#equation").val();
        setGraphsToInitial();
        $("#view-3d").empty();
        initRendering();
        playing = false;
    });

});