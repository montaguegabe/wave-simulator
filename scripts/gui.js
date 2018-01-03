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

    $('html').click(function() {
        $("#info").slideUp();
    });

    $("#helpButton").click(function(evt){
        $("#info").slideToggle();
        evt.stopPropagation();
    });

    $("#info").click(function(evt){
        evt.stopPropagation();
    });

    $("#toggleRealistic").click(function(){
        realistic = !realistic;
        $("#view-3d").empty();
        initRendering();
    });

    $("#waveEquation").click(function(){
        mode = modeWave;
        $("#preset").val("default");
    });

    $("#heatEquation").click(function(){
        mode = modeHeat;
        $("#preset").val("default");
    });

    $("#mixEquation").click(function(){
        mode = modeMix;
        $("#preset").val("default");
    });
    $("#blendFactor").blur(function(){
        heatWaveFactor = Number($(this).val());
        $("#preset").val("default");
    });


    $("#setFunction").click(function(){
        equationString = $("#equation").val();
        velocityString = $("#velocity").val();
        stableString = $("#stable").val();
        setGraphsToInitial();
        $("#view-3d").empty();
        initRendering();
        playing = false;
        $("#preset").val("default");
    });

    $("#zeroBoundary").change(function(){
        zeroBoundary = this.checked;
        $("#preset").val("default");
    });

    $("#stableBoundary").change(function(){
        stableBoundary = this.checked;
        $("#preset").val("default");
    });

    $("#period").blur(function(){
        period = Number($(this).val());
        if (period <= 1) alert("Warning: Setting the period to 1 will probably cause rounding errors in the approximation to build up and blow up the graph.");
        $("#preset").val("default");
    });

    $("#heatFactor").change(function(){
        heatFactor = Number($(this).val());
        if (heatFactor > 0.25) alert("Warning: Setting the heat factor high will probably cause rounding errors in the approximation to build up and blow up the graph.");
        $("#preset").val("default");
    });

    $("#preset").change(function(){
        var val = $(this).val();
        switch(val) {

            case "wave":
                $("#equation").val("pt(x-10, y+3, 5)*10");
                $("#velocity").val("0");
                $("#stable").val("0");
                $("#blendFactor").val(0.995);
                blendFactor = 0.995;
                $("#zeroBoundary").prop("checked", false);
                zeroBoundary = false;
                $("#stableBoundary").prop("checked", false);
                stableBoundary = false;
                mode = modeMix;
                $("#setFunction").trigger("click");
                break;
            case "heat":
                $("#equation").val("max(pt(x-6,y,9) - pt(x+3, y+2, 6), 0)*15");
                $("#velocity").val("0");
                $("#stable").val("0");
                $("#heatFactor").val(0.01);
                heatFactor = 0.01;
                mode = modeHeat;
                $("#setFunction").trigger("click");
                break;
            case "doubleSlit":
                $("#equation").val("x-=25;y/=4;exp(-(x*x+y*y)/5)*80*sin(x/1.5)");
                $("#velocity").val("0");
                $("#stable").val("abs(x-12)<1.5 and abs(y-7)>0.8 and abs(y+7)>0.8");
                $("#zeroBoundary").prop("checked", true);
                zeroBoundary = true;
                $("#stableBoundary").prop("checked", false);
                stableBoundary = false;
                mode = modeWave;
                $("#setFunction").trigger("click");
                break;
            case "standingWave":
                $("#equation").val("0");
                $("#velocity").val("cos(pi*sqrt(x*x+y*y)/24)*0.5+0.5");
                $("#stable").val("x*x+y*y>24*24");
                $("#zeroBoundary").prop("checked", true);
                zeroBoundary = true;
                $("#stableBoundary").prop("checked", true);
                stableBoundary = true;
                $("#period").val(2);
                period = 2;
                mode = modeWave;
                $("#setFunction").trigger("click");
                break;
            case "standingWave2":
                $("#equation").val("0");
                $("#velocity").val("(cos(pi*(x*x+y*y)/(24*24))*0.5+0.5)*sin(pi*x/24)");
                $("#stable").val("x*x+y*y>24*24");
                $("#zeroBoundary").prop("checked", true);
                zeroBoundary = true;
                $("#stableBoundary").prop("checked", true);
                stableBoundary = true;
                $("#period").val(2);
                period = 2;
                mode = modeWave;
                $("#setFunction").trigger("click");
                break;
        }
    })

});