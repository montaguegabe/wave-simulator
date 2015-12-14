$(document).ready(function() {

    $(function() {
        $('#view-3d').focus();
    });

    $("#toggleRealistic").click(function(){
        realistic = !realistic;
        $("#view-3d").empty();
        initRendering();
    });


    $("#setFunction").click(function(){
        equationString = $("#equation").val();
        //console.log(initialFunction);
        setGraphsToInitial();
        $("#view-3d").empty();
        initRendering();
    });

});