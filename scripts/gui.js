$(document).ready(function() {

    $('#view-3d').focus();
    $("#equation").val(equationString);
    $("#velocity").val(velocityString);
    $("#blendFactor").val(heatWaveFactor);

    $("#playPause").click(function(){
        playing = !playing;
    });

    $("#toggleRealistic").click(function(){
        realistic = !realistic;
        $("#view-3d").empty();
        initRendering();
    });

    $("#waveEquation").click(function(){
        mode = modeWave;
    });

    $("#heatEquation").click(function(){
        mode = modeHeat;
    });

    $("#mixEquation").click(function(){
        mode = modeMix;
    });
    $("#blendFactor").blur(function(){
        heatWaveFactor = Number($(this).val());
    });


    $("#setFunction").click(function(){
        equationString = $("#equation").val();
        velocityString = $("#velocity").val();
        setGraphsToInitial();
        $("#view-3d").empty();
        initRendering();
        playing = false;
    });

});