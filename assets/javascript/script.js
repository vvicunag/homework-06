
// Refresh and local storage gets cleared
localStorage.clear();

// Allows to transform unix timestamp into date format
var getFormattedDate = function (unixTimestamp, format = "DD/MM/YYYY") {
    return moment.unix(unixTimestamp).format(format);
}

//Assignment code
var recentSearchList = $("#recent-list");
var cityNamePool = JSON.parse(localStorage.getItem("cityNamePool"));

// Function will get weather conditions through Openweather's Api, manage local storage and display values
function getWeather(city) {
    // call API for current weather conditions in a city - even if a city is in search history, it will always call API for current conditions
    var weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=+" + city + "&appid=78cf9f9d7481d5e50a50d47d7313a911&units=metric";
    fetch(weatherApiUrl)
    .then(function(weatherApiResponse) {
        return weatherApiResponse.json();
    }).then(function(weatherData) {
        // display values
        $("#display-city").text(weatherData.name);
        $("#current-temp").text(weatherData.main.temp);
        $("#current-wind").text(weatherData.wind.speed + " m/s");
        $("#current-humidity").text(weatherData.main.humidity + "%");
        // following variables are needed for a second API call (that retrieves 5-day forecast):
        var lat = weatherData.coord.lat;
        var lon = weatherData.coord.lon;
        var cityName = weatherData.name;
        // if cityNamePool is not in localstorage, then create empty array
        if (cityNamePool === null) {
            cityNamePool = [];
        }
        // if array includes searched city, then retrieve the conditions for that city in storage
        if (cityNamePool.includes(cityName)) {
            var retrieveCity = JSON.parse(localStorage.getItem(cityName));

            //Loop will display 5-day forecast - retrieved from local storage
            for(var i = 0; i < 5; i++) {
                $("#card-date" + i).text(getFormattedDate(retrieveCity[i].dt));
                $("#card-temp" + i).text(retrieveCity[i].temp.day);
                $("#card-wind" + i).text(retrieveCity[i].wind_speed);
                $("#card-humidity" + i).text(retrieveCity[i].humidity);
            }
        }
        // if array does not include searched city:
        else {
            // create and append search button for that city, and push city into array
            buttonElement = $('<button class= "btn btn-secondary recent-button" id = "button-' + city + '">' + cityName + '</button>');
            $("#recent-list").append(buttonElement);
            cityNamePool.push(cityName);
            localStorage.setItem("cityNamePool", JSON.stringify(cityNamePool));
            //call 5-day forecast for that city
            var oneCallApi = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=currently,minutely,hourly,alerts&appid=78cf9f9d7481d5e50a50d47d7313a911&units=metric"
            fetch(oneCallApi)
            .then(function(oneCallResponse) {
                return oneCallResponse.json();
            }).then(function(oneCallData) {
                //slice will returb 5 days out of 7 that API offers, and that is stored as string in local storage
                var city5Forecast = oneCallData.daily.slice(1,6);
                localStorage.setItem(cityName, JSON.stringify(city5Forecast));
               
                //Loop will display 5-day forecast
                for(var i = 0; i < 5; i++) {
                    $("#card-date" + i).text(getFormattedDate(city5Forecast[i].dt));
                    $("#card-temp" + i).text(city5Forecast[i].temp.day);
                    $("#card-wind" + i).text(city5Forecast[i].wind_speed);
                    $("#card-humidity" + i).text(city5Forecast[i].humidity);
                }
        })}
    });
}

// on click, button for search initiates getWeather
$("#get-weather").on("click", function() {
    var city = $("#city-name").val()
    getWeather(city)
});

//on click, button for recent city searches initiates getWeather for corresponding city
recentSearchList.on('click', '.recent-button',  function(event) {
getWeather($(event.target).text());
})

