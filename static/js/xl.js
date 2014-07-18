function goFullscreen() {
    var element = document.getElementsByTagName("body")[0];

    if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    }
};


function updateForecast() {
    var skyMotionAPI = "http://api.skynalysis.com/1/nowcasterweb/nowcast.json?lat=35.307228&lon=-80.735824&nowcast_summary=1&lang=en&_=" + Math.random();
    $.getJSON(skyMotionAPI)
        .done(function (data) {
            var txt = "";
            if (data.nowcast_summary.intervals[0].precip_conf_descr) {
                txt += data.nowcast_summary.intervals[0].precip_conf_descr + "<br/>"
            }
            txt += "<span class='imp'>" + data.nowcast_summary.intervals[0].precip_descr + "</span><br/> for next <span class='imp'>";
            txt += ((data.nowcast_summary.intervals[0].end_epoch - data.nowcast_summary.intervals[0].start_epoch + 1) / 1000 / 60) + "</span> minutes";
            $("#fr_text").html(txt)

            $("#fr_icon").css("background-image", "url(" + data.nowcast_summary.intervals[0].icon_url + ")")

            $("#tf_text").text(data.nowcast_summary.intervals[0].feels_like_f+"F");
            $("#tc_text").text(data.nowcast_summary.intervals[0].feels_like_c+"C");
        });
};
setInterval(updateForecast, 30000);
updateForecast();

function updateRide() {
    var estimation_url = "get/http://nextride.uncc.edu/Services/JSONPRelay.svc/GetMapStopEstimates?_=" + Math.random();

    $.getJSON(estimation_url, function (data) {
        var ret = processRide(data.contents);
        updateRideScreen(ret);
    });
}

function processRide(data) {
    var ret = {};
    for (var routeKey in data) {
        var route = data[routeKey];
        var rname = route.Description;
        ret[rname] = {};
        for (var stopKey in route.RouteStops) {
            var stop = route.RouteStops[stopKey];
            var sname = stop.Description;
            if (sname.toLowerCase().indexOf("woodward") != -1) {
                ret[rname][sname] = [];
                for (var estKey in stop.Estimates) {
                    var est = stop.Estimates[estKey];
                    if (est.OnRoute){
                        ret[rname][sname].push(Math.floor(est.SecondsToStop / 60.0));
                    }
                }
                ret[rname][sname].sort(function (a, b) {
                    return a - b;
                });
            }
        }
    }
    return ret;
}

function updateRideScreen(rides) {
    var boxs = {
        "Red-wb": ["Red 50", "Woodward Hall (WB)"],
        "Red-eb": ["Red 50", "Woodward Hall (EB)"],
        "Yellow": ["Yellow 47", "Woodward Hall (WB)"],
        "SafeRide": ["Saferide", "SAC/Woodward/Loading Dock"],
        "Green-eb": ["Green 49", "Woodward Hall (EB)"]};
    var keys = {"display": "none", "1st": "&nbsp;", "2nd": "&nbsp;"};

    for (var box in boxs) {
        var data = {}
        var route = boxs[box][0];
        var stop = boxs[box][1];

        for (var key in keys) {
            data[key] = keys[key];
        }

        if (route in rides && stop in rides[route] && rides[route][stop].length > 0) {
            data["display"] = "inline-block";
            data["1st"] = rides[route][stop][0];
            if (rides[route][stop].length > 1) data["2nd"] = rides[route][stop][1];

            if (data["1st"] == 0) data["1st"] = "★";
            if (data["2nd"] == 0) data["2nd"] = "★";
        }

        $("#ride-" + box).css("display", data["display"]);
        $("#ride-" + box + "-" + "1st").html(data["1st"]);
        $("#ride-" + box + "-" + "2nd").html(data["2nd"]);
    }
}

setInterval(updateRide, 15000);
updateRide();