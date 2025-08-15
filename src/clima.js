function getWeather() {
    var apiKey = 'fcf1fc32c090cb6b4f891dbcb7b1baf2'; 
    var url = "https://api.openweathermap.org/data/2.5/weather?q=Sao%20Paulo&appid=" + apiKey + "&units=metric";

    fetch(url)
        .then(response => response.json())
        .then(data => {
            var temperature = Math.round(data.main.temp);
            var weatherIcon = data.weather[0].icon;

            document.querySelector('.temperatura').textContent = temperature + " °C";
            document.querySelector('#weather-icon').innerHTML = '<img src="http://openweathermap.org/img/w/' + weatherIcon + '.png" alt="Weather Icon">';
        })
        .catch(error => {
            console.log("Erro ao obter dados do clima:", error);
        });
}

setInterval(getWeather, 600000);