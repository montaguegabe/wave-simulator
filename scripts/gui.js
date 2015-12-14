$(document).ready(function() {

    $('#view-3d').focus();
    $("#equation").val(equationString);
    $("#velocity").val(velocityString);
    $("#stable").val(stableString);
    $("#blendFactor").val(heatWaveFactor);
    $("#zeroBoundary").prop('checked', zeroBoundary);
    $("#stableBoundary").prop('checked', stableBoundary);
    $("#period").val(period);
    $("#heatFactor").val(heatFactor);

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
        stableString = $("#stable").val();
        setGraphsToInitial();
        $("#view-3d").empty();
        initRendering();
        playing = false;
    });

    $("#zeroBoundary").change(function(){
        zeroBoundary = this.checked;
    });

    $("#stableBoundary").change(function(){
        stableBoundary = this.checked;
    });

    $("#period").blur(function(){
        period = Number($(this).val());
        if (period <= 1) alert("Warning: Setting the period to 1 will probably cause rounding errors in the approximation to build up and blow up the graph.")
        console.log(period);
    });

    $("#heatFactor").change(function(){
        heatFactor = Number($(this).val());
        if (heatFactor > 0.25) alert("Warning: Setting the heat factor high will probably cause rounding errors in the approximation to build up and blow up the graph.")
        console.log(heatFactor);
    });

});