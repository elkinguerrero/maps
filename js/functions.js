$(document).ready(function(){
    //se escucha el clik para el menu
    $('.cerrar_pop_up').click(function(){
        $('.menu_lateral').animate({'left':-($('.menu_lateral').width())},500);
    })
    $('.abrir_pop_up').click(function(){
        $('.menu_lateral').animate({'left':'0%'},500);
    })
})

//funcion que realiza una peticion get o post y retorna los datos 
//recibe 
//url = destino de la busqueda
//send = variables a enviar por post a la url
//metod = GET o POST
//async = true o false
function peticion(url,send,metod,async){
    var respuesta = new XMLHttpRequest();
    respuesta.onreadystatechange = function() {};
    respuesta.open(metod, url, async);
    respuesta.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    respuesta.send(send);
    if(respuesta.status == 200 && respuesta.readyState == 4){
        return respuesta.responseText;
    }
    else{
        return 'error conexión incorrecta'
    }
}

//La funcion clase_puntero añade las clases a cada
//punto en el mapa para manipularlas y dicta los parametros de
//escucha para que cuando se pase el cursos se llene el popup
function clase_puntero(){
    //se recorren todos los elementos del mapa y se pone la clase puntero a los
    //puntos en el mapara para mejor manipulacion
    contador = $('img');
    for(i=0;i<contador.length;i++){
        if(contador[i].src =='https://kindrez.com:85/img/puntero.png'){
            contador[i].className = contador[i].className+" puntero";
        }
    }

    //se llama la funcion que escucha los hover de cada punto en el mapa
    $(".puntero").hover(function(){
            this.parentElement.id = this.parentElement.title != '' ? this.parentElement.title : this.parentElement.id;
            this.parentElement.title = '';

            //la variable popup_top acomoda el popup cuando sale de la pantalla
            popup_top = $('#'+this.parentElement.id).offset().top < 220 ? $('#'+this.parentElement.id).offset().top + 30: $('#'+this.parentElement.id).offset().top -224 ;
            $('.popup_descripcion').css({'top':popup_top,'left':$('#'+this.parentElement.id).offset().left-125})

            //se llena el popup con los datos de la provincia
            temporal = this.parentElement.id.replace("province_", "");
            temporal = parseInt(temporal);
            temporal = datos.province.data[temporal];

            $('.popup_pais').html(temporal.location);
            $('.popup_casos').html(temporal.confirmed);
            $('.popup_activo').html(temporal.confirmed - temporal.recovered - temporal.dead);
            $('.popup_recuperados').html(temporal.recovered == null ? 'sin datos' : temporal.recovered );
            $('.popup_fallecidos').html(temporal.dead);

            //se muestra el popup
            $('.popup_descripcion').fadeIn();
        }, function(){
            $('.popup_descripcion').hide();
    });
    $(".puntero").click(function(){
        this.parentElement.id = this.parentElement.title != '' ? this.parentElement.title : this.parentElement.id;
        this.parentElement.title = '';

        //la variable popup_top acomoda el popup cuando sale de la pantalla
        popup_top = $('#'+this.parentElement.id).offset().top < 220 ? $('#'+this.parentElement.id).offset().top + 30: $('#'+this.parentElement.id).offset().top -224 ;
        $('.popup_descripcion').css({'top':popup_top,'left':$('#'+this.parentElement.id).offset().left-125})

        //se llenan los datos del popup
        temporal = this.parentElement.id.replace("province_", "");
        temporal = parseInt(temporal);
        temporal = datos.province.data[temporal];

        $('.popup_pais').html(temporal.location);
        $('.popup_casos').html(temporal.confirmed);
        $('.popup_activo').html(temporal.confirmed - temporal.recovered - temporal.dead);
        $('.popup_recuperados').html(temporal.recovered == null ? 'sin datos' : temporal.recovered );
        $('.popup_fallecidos').html(temporal.dead);

        //se muestra el popup
        $('.popup_descripcion').fadeIn();
    });
}

//carga el menu desplegable con las opciones de las provincias
function cargar_lista_menu(){
    //Se cargan las provincias en el filtro
    for(i=0;i<datos.province.data.length;i++){
        if(datos.province.data[i].country_code == datos.country.data[datos.pais_seleccionado].country_code){
            $("#myDropdown").append('<a href="javascript:;" class="filtro f_'+i+'">'+datos.province.data[i].location+'</a>')
        }
    }

    $('.filtro').click(function(){
        dibujar_poligono(this.classList[1].replace('f_',''))
    })
}

//En esta funcion se dibuja cada punto
//en el mapa de la api de google
function dibujar_puntos(){
    //se traen los puntos de la data.js
    //se recorre las provincias y se marcan los puntos al mapa
    if(datos.province.data[datos.setInterval_contador].country_code == datos.country.data[datos.pais_seleccionado].country_code){
        var latLng = new google.maps.LatLng(datos.province.data[datos.setInterval_contador].latitude,datos.province.data[datos.setInterval_contador].longitude);
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: 'img/puntero.png',
            title: 'province_'+datos.setInterval_contador
        });

        datos.market.push(marker);
    }

    datos.setInterval_contador += 1;
    if(datos.setInterval_contador >= datos.province.data.length ){
        clearInterval(datos.setInterval);
        clase_puntero();

        if(datos.inicio){
            $('.menu_lateral').animate({'left':'0%'},500);
            cargar_lista_menu();
            calcular_suma_menu();
            ocultar_puntos();
        }
    }
}

//En esta fuincion se dibuja el poligono de cada provincia
//num_provincia = es el numero que contiene el id de la provincia a dibujar
function dibujar_poligono(num_provincia){
    if(datos.poligonos['p_'+num_provincia] == null || datos.poligonos['p_'+num_provincia] == 'null'){
        console.log('https://raw.githubusercontent.com/unitedstates/districts/gh-pages/states/'+datos.code_province[datos.province.data[ num_provincia ].location]+'/shape.geojson')
        datos.satete_unity = JSON.parse(peticion('https://raw.githubusercontent.com/unitedstates/districts/gh-pages/states/'+datos.code_province[datos.province.data[ num_provincia ].location]+'/shape.geojson','','GET',false));
        temporal = [];
        for(i=0;i<datos.satete_unity.coordinates[0][0].length;i++){
            temporal [i] = {lat:datos.satete_unity.coordinates[0][0][i][1],lng:datos.satete_unity.coordinates[0][0][i][0]}
        }
        
        color = 'rgba('+Math.floor((Math.random() * 255) + 1)+','+Math.floor((Math.random() * 255) + 1)+','+Math.floor((Math.random() * 255) + 1)+',1)';

        datos.poligonos['p_'+num_provincia] = new google.maps.Polygon({
            paths: temporal,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.35
        });
        datos.poligonos['p_'+num_provincia].setMap(map);

        //se guardan los que se van agregando a la pantalla para despues sumarlos
        datos.poligonos.suma.push( parseInt( num_provincia ))
        calcular_suma_menu();
        dibujar_boton_borrar_poligono(num_provincia);
    }
}

//se borra el poligono previamente dibujado
//estado = es el id que se recolecta cuando se crea el poligono
function borrar_poligono(estado){
    if(datos.poligonos[estado] != null && datos.poligonos[estado] != 'null'){
        datos.poligonos[estado].setMap(null);
        datos.poligonos[estado] = null;

        for(i=0;i<datos.poligonos.suma.length;i++){
            if(datos.poligonos.suma[i] == parseInt(estado.replace('p_',''))){
                datos.poligonos.suma[i] = null;
            };
        }
    }
}

//funciones para el filtro del boton menu
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}
  
function filterFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("myDropdown");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
      } else {
        a[i].style.display = "none";
      }
    }
}

//funcion para buscar el id del codigo del pais
//code_country = texto del pais segun el objeto json ejemplo 'us'
//retorna el numero usado para el id
function buscar_pais(code_country){
    //sew filtra del array el pais seleccionado
    for(i=0;i<datos.country.data.length;i++){
        if(datos.country.data[i].country_code == code_country){
            return i;
        }
    }
}

//Esta funcion cambia los numeros del menu mediante una animacion de transicion
//todas las variables recibidas son numericas y cuando se invoca esta funcion 
//en la pantalla se ven los numeros introducidos en la funcion
function numeros_menu(activos,recuperados,fallecidos, totales){
    clearInterval(datos.setInterval_numeros)
    datos.numeros_menu = {
        activos: {
            'inicio':parseInt($('.menu_casos_activos').html()),
            'fin':activos
        },
        recuperados:{
            'inicio':parseInt($('.menu_casos_recuperados').html()),
            'fin':recuperados
        },
        fallecidos:{
            'inicio':parseInt($('.menu_casos_fallecidos').html()),
            'fin':fallecidos
        },
        totales:{
            'inicio':parseInt($('.menu_casos_totales').html()),
            'fin':totales
        },
        porcentaje_carga:0
    }

    datos.setInterval_numeros = setInterval(animacion_numeros, 10);
}

//funcion que sobrescribe los campos de los numeros en el menu principal
function animacion_numeros(){
    datos.numeros_menu.porcentaje_carga  +=1;
    $('.menu_casos_activos').html(parseInt(datos.numeros_menu.activos.inicio + (datos.numeros_menu.activos.fin - datos.numeros_menu.activos.inicio) / 100 * datos.numeros_menu.porcentaje_carga))
    $('.menu_casos_recuperados').html(parseInt(datos.numeros_menu.recuperados.inicio + (datos.numeros_menu.recuperados.fin - datos.numeros_menu.recuperados.inicio) / 100 * datos.numeros_menu.porcentaje_carga))
    $('.menu_casos_fallecidos').html(parseInt(datos.numeros_menu.fallecidos.inicio + (datos.numeros_menu.fallecidos.fin - datos.numeros_menu.fallecidos.inicio) / 100 * datos.numeros_menu.porcentaje_carga))
    $('.menu_casos_totales').html(parseInt(datos.numeros_menu.totales.inicio +(datos.numeros_menu.totales.fin - datos.numeros_menu.totales.inicio) / 100 * datos.numeros_menu.porcentaje_carga))
    if(datos.numeros_menu.porcentaje_carga  >= 100){
        clearInterval(datos.setInterval_numeros)
    }
}

//Calcula la diferencia entre un numero incial y final para despues pintarla en el menu principal
//si no hay ninguna provincia seleccionada el tomara la suma de todos las provincias
function calcular_suma_menu(){
    temporal_validar = false;
    suma = {
        totales:0,
        activos:0,
        recuperados:0,
        fallecidos:0
    }
    for(i=0;i<datos.poligonos.suma.length;i++){
        if(datos.poligonos.suma[i] != null && datos.poligonos.suma[i] != 'null'){
            temporal = datos.province.data[datos.poligonos.suma[i]];
            suma.totales += temporal.confirmed;
            suma.activos += temporal.confirmed - temporal.recovered - temporal.dead
            suma.recuperados += temporal.recovered == null ? 0 : temporal.recovered
            suma.fallecidos +=temporal.dead;
            temporal_validar = true;
        }
    }

    if(!temporal_validar){
        for(i=0;i<datos.province.data.length;i++){
            if(datos.province.data[i].country_code == datos.country.data[datos.pais_seleccionado].country_code){
                temporal = datos.province.data[i];
                suma.totales += temporal.confirmed;
                suma.activos += temporal.confirmed - temporal.recovered - temporal.dead
                suma.recuperados += temporal.recovered == null ? 0 : temporal.recovered
                suma.fallecidos +=temporal.dead;
            }
        }
    }

    numeros_menu(suma.activos,suma.recuperados,suma.fallecidos,suma.totales)
}

//esta funcion crea un boton que se dispara cuando se selecciona una provincia en el menu desplegable
//la funcion tambien escucha cuando se oprime este boton creado
//poligono = es el id del poligono a borrar
function dibujar_boton_borrar_poligono(poligono){
    $('.poligonos_borrar').append('<button class="btn btn-danger boton_menu_borrar borrar b_'+poligono+'">'+datos.province.data[poligono].location+'</button>')

    $('.borrar').click(function(){
        borrar_poligono("p_"+this.classList[4].replace('b_',''));
        $('.'+this.classList[4]).remove();
        calcular_suma_menu();
    });
}

//esta funcion oculta todos los puntos cargados sobre el mapa y los oculta segun si se oprime la opcion de oculta puntos
function ocultar_puntos(){
    $('.round').click(function(){
        if(datos.market.length != 0){
            for(i=0;i<datos.market.length;i++){
                datos.market[i].setMap(null);
            }
            datos.market = []
        }
        else{
            datos.setInterval_contador = 0;
            datos.inicio = false;
            datos.setInterval = setInterval(dibujar_puntos, 5);
        }
    })
}