//se crea el objeto mapa
var map;

function initMap() {
    //function en functions.js
    datos.pais_seleccionado = buscar_pais("us");
    
    //Se instancia el mapa
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: new google.maps.LatLng(datos.country.data[datos.pais_seleccionado].latitude,datos.country.data[datos.pais_seleccionado].longitude),
        mapTypeId: 'roadmap'
    });

    map.addListener('drag', function(e) {
        $('.popup_descripcion').hide();
    });

    //funcion ubicada en functionsjs
    datos.setInterval_contador = 0;
    datos.inicio = true;
    datos.setInterval = setInterval(dibujar_puntos, 5);
}