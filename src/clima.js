function getWeather() {
    var apiKey = '46ad9bcd907578b771c54270a3560cb3'; 
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