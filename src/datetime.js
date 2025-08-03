// Função para atualizar a data e hora
function updateDateTime() {
    var data = new Date();
    var dia = data.getDate();
    var mes = data.getMonth() + 1;
    var ano = data.getFullYear();
    var hora = data.getHours();
    var minutos = data.getMinutes();
    var dataFormatada = (dia < 10 ? '0' : '') + dia + '/' + (mes < 10 ? '0' : '') + mes + '/' + ano;
    var horaFormatada = (hora < 10 ? '0' : '') + hora + ':' + (minutos < 10 ? '0' : '') + minutos;

    // Atualiza a data e hora no HTML
    document.querySelector('.hora').textContent = horaFormatada;
    document.querySelector('.dia').textContent = dataFormatada;
}

// Atualiza a data e hora a cada segundo
setInterval(updateDateTime, 1000);