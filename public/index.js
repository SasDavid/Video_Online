const socket = io();


let WatchStatic = "";
let loginPlayer = {};
let loginStatus = null;


socket.on("reconnect", (info)=>{
  if (WatchStatic == "") WatchStatic = info;
  socket.emit("actualizando", loginPlayer);
})


socket.on("register", ()=>{
  if(loginPlayer == null){
    document.getElementById("section-register").style.opacity = 1;
  }
})

const containerRegister = document.getElementById("container-register");
const inputRegister = document.querySelectorAll(".register-input");

containerRegister.addEventListener("submit", e =>{
  e.preventDefault();

  if(inputRegister[0].value.length > 8) return;

  loginPlayer = {};
  loginPlayer.name = inputRegister[0].value;
  loginPlayer.clave = inputRegister[1].value;
  if(loginStatus != null) loginPlayer.status = loginStatus;
  // else{
  //   loginPlayer.status = "Cargando... 1/2";
  // } 
  socket.emit("login", loginPlayer);

  document.getElementById("section-register").style.opacity = 0;
  document.body.style.overflow = "auto";
  setTimeout(()=>{
      document.getElementById("section-register").style.display = "none";
  }, 500)

})

socket.on("login", data=>{
  console.log("actualizandoPlayers")
  let documentFrag = document.createDocumentFragment();

  for (let i = 0; i < data.length; i++) {
    let createUsuario = document.createElement("DIV");
    createUsuario.classList.add("person");
    createUsuario.innerHTML = `name: ${data[i].name} <br> 
                                 status: ${data[i].status}`

    if(data[i].name == loginPlayer.name){
      createUsuario.style.border = "1px solid #fff";
    }
    documentFrag.appendChild(createUsuario);
  }

  containerOnline.innerHTML = "";
  containerOnline.appendChild(documentFrag);
})



let getDurationFija;
let getDurationFijaCompleta;

setInterval(function() {
  socket.emit('ping');
}, 5000); // Envia un ping cada 5 segundos


function barraAzulFull(){

   // Obtener el tiempo actual del video en segundos
    const currentTime = player.getCurrentTime();

    // Obtener la duración total del video en segundos
    const duration = player.getDuration();

       // ACTUALIZAR BARRA AZUL
    const progress = currentTime / duration;
    const progressPercent = progress * 100;
    blueProgressBar.style.width = `${progressPercent}%`;

}


let modelInferior = document.getElementById("panel-inferior");
let modelInferiorB = false;

const videoVista = document.querySelector(".panel-control");
const tiempoAproximado = document.querySelector(".tiempoAproximado");


const panelCompleto = document.querySelector(".panel-completo");
// .container-video

panelCompleto.addEventListener("mouseenter", e=>{
  if(modelInferiorB){
    modelInferior.style.transform = "translateY(0)";
  }
})

panelCompleto.addEventListener("mouseleave", e=>{
  // console.log("rere")
  dragVista = false;
  tiempoAproximado.style.display = "none";
  if(modelInferiorB){
    modelInferior.style.transform = "translateY(30px)";
    velocidadesDesactivar();
  }
})

  let dragVista = false;
  let dragClick = false;

  videoVista.addEventListener("mousedown", e=>{

    e.stopPropagation()
    if(e.which == 3) return; //Retornar si se da click derecho
    tiempoAproximado.style.display = "block";
    document.querySelector(".ytp-progress-blue").style.background = "#2296ff";
    dragClick = true;

  })


  function dragEnter(e){

    e.stopPropagation();

    document.querySelector(".ytp-progress-blue").style.background = "#1876CC";

    dragClick = false;
    dragVista = false;
    tiempoAproximado.style.display = "none";

    // Obtener la duración total del video en segundos
    // let duration = getDurationFija;
    let duration = player.getDuration();

    // Obtener la posición del clic en la barra roja
    const rect = videoVista.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const position = offsetX / rect.width;

     // Calcular el tiempo correspondiente en el video en función de la duración total y la posición del click
    const time = duration * position;

    //Desactivamos el intervalor para que se reanude cuando cargue el vídeo
    clearInterval(procesando);


    // ACTUALIZAR BARRA AZUL
    const progress = time / duration;
    const progressPercent = progress * 100;

    if(time + 1.5 >= player.getDuration()){
       // player.seekTo(player.getDuration());
       // blueProgressBar.style.width = "100%";
       socket.emit("sincronizar", {time: player.getDuration(), progressPercent: 100, tiempoAproximado: tiempoAproximado.textContent, end: "1"});
       end = true;
       // socket.emit("server-mensaje", "");
    } else  {
      // socket.emit("server-mensaje", "");
      socket.emit("sincronizar", {time, progressPercent, tiempoAproximado: tiempoAproximado.textContent});
      end = false;
      videoStatus = true;
    }

  }

  videoVista.addEventListener("click", e=>{

    dragEnter(e);
    if(end){
      iconoResumenB = false;
      iconoResumenF();
      videoStatus = true;
    }
    e.stopPropagation();

  })

  videoVista.addEventListener("mouseleave", e=>{

    e.stopPropagation();

    // Obtener el tiempo actual del video en segundos
    let currentTime = player.getCurrentTime();

    // Obtener la duración total del video en segundos
    let duration = player.getDuration();

    actualizarTime();

       // ACTUALIZAR BARRA AZUL
    let progress = currentTime / duration;
    let progressPercent = progress * 100;

    // blueProgressBar.style.width = `${progressPercent}%`;

    if(!dragClick) {
      // actualizarTime();
      dragVista = false;
      tiempoAproximado.style.display = "none";

      // Obtener el tiempo actual del video en segundos
      currentTime = player.getCurrentTime();

      // Obtener la duración total del video en segundos
      // duration = getDurationFija;

      // actualizarTime();

      //Al darle click a la barra de carga, que no se actualice el width desde acá
      progress = currentTime / duration;
      progressPercent = progress * 100;
      blueProgressBar.style.width = `${progressPercent}%`;
    }

  })

  function formatTime(timeInSeconds, num) {
      let minutes;
      let seconds;
        
      if(num == 2){
         minutes = Math.floor(timeInSeconds / 60);
         seconds = Math.round(timeInSeconds % 60);
         return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
      }

  }



  function ytpAzulAndClick(e){

    dragVista = true;

    let duration = player.getDuration();

    // Obtener la posición del clic en la barra roja
    const rect = videoVista.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const position = offsetX / rect.width;

     // Calcular el tiempo correspondiente en el video en función de la duración total y la posición del click
    const time = duration * position;

    // console.log(Math.ceil(time));
    let totalSegundo = Math.floor(time);
    // console.log(totalSegundo);

    // Obtener el tiempo actual del video en segundos
    const currentTime = player.getCurrentTime();

    // ACTUALIZAR BARRA AZUL
    const progress = time / duration;
    const progressPercent = progress * 100;

    blueProgressBar.style.width = `${progressPercent}%`;

    let currentTimeFormatted = formatTime(time, 2);
    let durationFormatted = formatTime(duration, 2);

     if(totalSegundo >= duration){
       tiempoAproximado.textContent = `${durationFormatted}/${durationFormatted}`;
       blueProgressBar.style.width = "100%";
       return;
     } else if(totalSegundo <= 0){
       tiempoAproximado.textContent = `0:00/${durationFormatted}`;
       blueProgressBar.style.width = "0";
       return;
     }

    tiempoAproximado.textContent = `${currentTimeFormatted}/${durationFormatted}`;

  }

  videoVista.addEventListener("mousemove", e=>{
    ytpAzulAndClick(e);
    e.stopPropagation();
    tiempoAproximado.style.display = "block";
  })

  panelCompleto.addEventListener("mousemove", e=>{
    if(!dragClick) return;
    ytpAzulAndClick(e);
  })

  panelCompleto.addEventListener("mouseleave", e=>{
    dragClick = false;
  })


// ------------------ Video YT ------------------//

let videoStatus = false;

var button = document.querySelector("#boton");

var player;
function onYouTubeIframeAPIReady() {
console.log('Conexión exitosa');
on = true;

player = new YT.Player('player', {
  // height: '360',
  // width: '640',
  videoId: WatchStatic != "" ? WatchStatic : 'XAFreTjJr6k',
    playerVars: {
            // enablejsapi: 1,
            showinfo: 1,
            rel: 1,
            controls: 0
            // autoplay: 0,
            // showRelatedVideos : 1
          },
    events: {
    'onReady': onPlayerReady,
    'onStateChange': onPlayerStateChange,
    'onError': onError
    }
  });
}






const panelIcon = document.querySelector(".panel-icon");
let panelIconB = false;


let videoReproducido = false;
let end = false;
let procesando = null;

panelCompleto.addEventListener("click", e =>{

 if((end) && dragClick){
      end = false;
      videoStatus = true;
      dragEnter(e);
      e.stopPropagation();
      return;
  } else if (dragClick){
    dragEnter(e);
    return;
  }

  dragVista = false;

  if(end){
      player.seekTo(0);
      iconoResumenB = true;
      iconoResumenF();
      end = false;
      youtubeResumen.style.display = "block";
      youtubePause.style.display = "none";
      panelIcon.style.cursor = "progress";
      videoStatus = true;
      e.stopPropagation();
    return;
  }

  if(videoReproducido){

    if(panelIconB){

      videoStatus = true;
      velocidadesDesactivar();
      youtubeResumen.style.display = "block";
      youtubePause.style.display = "none";
      panelIcon.style.cursor = "progress";
      player.playVideo();
      iconoResumenB = true;
      iconoResumenF();
      videoReproducido = false;
      panelIconB = false;
 
    } else {
        
        // No puedes pausar llegando al final
        if(player.getCurrentTime() + 1.5 >= getDurationFija) return;

        youtubeResumen.style.display = "none";
        youtubePause.style.display = "block";
        panelIcon.style.cursor = "pointer";
        player.pauseVideo();
        iconoResumenB = false;
        iconoResumenF();

    }
  }

})

function getBrowserLanguage() {
    var userLang = navigator.language || navigator.userLanguage;
    return userLang.substr(0, 2);
}

const subIcon = document.getElementById("sub-icon");
let subIconB = false;
let subStatus = false;
let audioNull = true;

function audioNullF(){

  if(!audioNull){

    document.querySelector(".path-sub").style.fill = "#fff";
    document.querySelector(".path-sub").style.opacity = 1;
    subIcon.style.cursor = "pointer";

  }

}

function activesubtitulo(){

  subStatus = true;

  //¿Qué hace la propiedad "player.setOption" y "player.getOption" de la api de Youtube en JavaScript?

  // IDIOMA POR AUTOMÁTICO
  player.loadModule('captions');
        var userLang = getBrowserLanguage();
        player.setOption('captions', 'track', {
          'languageCode': userLang
  });

  var activeCues = player.getOption('captions', 'track');
  if(activeCues == undefined){
     audioNull = true;
     subIconB = false;
     document.querySelector(".path-sub").style.fill = "#A4A4A4";
     document.querySelector(".path-sub").style.opacity = 0.7;
     subIcon.style.cursor = "default";
  } else {
    subIconB = true;
    document.querySelector(".path-sub").style.fill = "#3A75F0";
    document.querySelector(".path-sub").style.opacity = 1;
  }

    // IDIOMA POR DEFECTO ---------------------------------
  // player.loadModule('captions');
  // player.setOption('captions', 'track', {
  //    'languageCode': 'es'
  // });

}

function disableSubtitles() {
  subIconB = false;
  player.unloadModule('captions');

  document.querySelector(".path-sub").style.fill = "#fff";
  document.querySelector(".path-sub").opacity = 1;
}

subIcon.addEventListener("click", e =>{

  if(!audioNull){
    // if(videoReproducido){
      if(subStatus){
        if(videoOn){
          if(subIconB){
            disableSubtitles();
          }else{
            activesubtitulo();
          }
        }
      } else {
       if(!subIconB) {
          document.querySelector(".path-sub").style.fill = "#3A75F0";
          subIconB = true;
        } else {
          document.querySelector(".path-sub").style.fill = "#fff";
          subIconB = false;
        }
      // }
    }
  }
  e.stopPropagation();
})

function velocidadesActive(){

  containerVelocidadBlack.style.display = "block";
  setTimeout(()=>{

      containerVelocidad.style.transform = "translateY(0)";

  }, 5)

  velocidadesB = true;

  document.querySelector(".path-velocidad").style.fill = "#3A75F0";

}

function velocidadesDesactivar(){

  containerVelocidad.style.transform = "translateY(200px)";
    
    setTimeout(()=>{

        containerVelocidadBlack.style.display = "none";

    }, 100)

    velocidadesB = false;

    document.querySelector(".path-velocidad").style.fill = "#fff";

}


const containerVelocidad = document.getElementById("velocidad-container");
const containerVelocidadBlack = document.getElementById("velocidad-container-black");
const velocidadIcon = document.getElementById("velocidad-icon");
let velocidadesB = false;

velocidadIcon.addEventListener("click", e =>{
  if(velocidadesB) velocidadesDesactivar();
  else velocidadesActive();
  e.stopPropagation();
})

const velocidadLi = document.querySelectorAll(".velocidad-li");

for (let i = 0; i < velocidadLi.length; i++) {
  let valorVeloz;

  if(i == 0) valorVeloz = 2;
  if(i == 1) valorVeloz = 1.75;
  if(i == 2) valorVeloz = 1.50;
  if(i == 3) valorVeloz = 1.25;
  if(i == 4) valorVeloz = 1;
  if(i == 5) valorVeloz = 0.75;
  if(i == 6) valorVeloz = 0.50;
  if(i == 7) valorVeloz = 0.25;

  velocidadLi[i].addEventListener("click", ()=>{
    player.setPlaybackRate(valorVeloz);
  })
}

const youtubeResumen = document.getElementById("container-icon-youtube-resumen");
const youtubePause = document.querySelector(".icon-youtube-2");

socket.on("connect_error", function(error) {
  alert("Error de conexión con el servidor, reinicia por favor");
  history.go();
});


// SECTION PARA TODA FULLSCREEN --------------------------------------------

const elemento = document.querySelector('.container-video');
const fullScreen = document.querySelector(".path-screen");
const containerScreen = document.getElementById("container-screen");



// Tenga en cuenta que algunos navegadores pueden tener diferentes nombres para el evento 
// fullscreenchange. Por ejemplo, en Safari, el evento se llama webkitfullscreenchange. 
// Para asegurarse de que su código funcione en todos los navegadores, 
// puede agregar una verificación para cada nombre de evento posible:

function exitHandler() {
  if (!document.fullscreenElement) {
    fullScreen.style.fill = "#fff";
  }
}

document.addEventListener("fullscreenchange", exitHandler);
document.addEventListener("webkitfullscreenchange", exitHandler);
document.addEventListener("mozfullscreenchange", exitHandler);
document.addEventListener("MSFullscreenChange", exitHandler);

// El código que estás mostrando es para detectar y utilizar 
// los métodos específicos de cada navegador para entrar y salir de la pantalla completa. 
// Aquí te explico lo que significa cada una de las condiciones:

// if (!document.fullscreenElement): Esta condición verifica 
//   si el documento actual no está en modo pantalla completa en ningún navegador. Si es así, 
// se activa la lógica para entrar en modo pantalla completa.

// if (elemento.requestFullscreen) {...}: Esta condición 
//   verifica si el navegador es compatible con el método requestFullscreen para entrar en modo 
// pantalla completa. Este método es compatible con la mayoría de los navegadores modernos, 
// excepto Internet Explorer (para el cual se utiliza msRequestFullscreen).

// else if (elemento.webkitRequestFullscreen) {...}: Esta
//  condición es para el navegador Safari, que utiliza un prefijo "webkit" para sus métodos. Si 
// el navegador es Safari, se utiliza webkitRequestFullscreen para entrar en modo pantalla completa.

// else if (elemento.msRequestFullscreen) {...}: Esta 
//   condición es para el navegador Internet Explorer, que utiliza un método específico llamado 
// msRequestFullscreen para entrar en modo pantalla completa.

// if (document.exitFullscreen) {...}: Esta condición 
//   verifica si el navegador es compatible con el método
//    exitFullscreen para salir del modo pantalla completa. Este método es compatible con 
//    la mayoría de los navegadores modernos, excepto Internet Explorer (para el cual se utiliza msExitFullscreen).

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    fullScreen.style.fill = "#3A75F0";
    if (elemento.requestFullscreen) {
      elemento.requestFullscreen();
    } else if (elemento.webkitRequestFullscreen) { /* Safari */
      elemento.webkitRequestFullscreen();
    } else if (elemento.msRequestFullscreen) { /* IE11 */
      elemento.msRequestFullscreen();
    } else if (elemento.mozRequestFullScreen) { /* Firefox */
      elemento.mozRequestFullScreen();
    }
  } else {
    fullScreen.style.fill = "#fff";
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    }
  }
}


containerScreen.addEventListener("click", e =>{
  toggleFullScreen();
  e.stopPropagation();
})


// ----------------------------------------------------------------------------


const containerError = document.getElementById("container-informe");
const mensajeError = document.querySelector(".mensaje-informe");

mensajeError.addEventListener("click", ()=>{
  mensajeError.style.transform = "translateY(-400px)";

  setTimeout(()=>{
      containerError.style.display = "none";
  }, 500)
})

function onError(event) {

    if(event.data == 150){
      loginPlayer.status = "Esperando...";
      socket.emit("changeStatus", "Esperando...");
      panelIcon.style.display = "none";
      containerError.style.display = "block";
      mensajeError.style.transform = "translateY(0)";
    }

}

var getCurrentTimeButton = document.getElementById("boton");
var sincronizar = document.getElementById("sincronizar");
var videoB = false;


socket.on("sincronizar", info=>{

  clearInterval(procesando);
  procesando = null;
  // console.log("1");
  blueProgressBar.style.width = `${info.progressPercent}%`;
  player.seekTo(info.time);
  // console.log(info.progressPercent);

  if(info.end == undefined) {
      panelTimeVideo.textContent = info.tiempoAproximado;
  }

  if(end){
      iconoResumenB = true;
      iconoResumenF();
      videoStatus = true;
      end = false;
  }                                                                                                                                                                                                                                                                                                                                                                                                                                                                    

})

function actualizarTime(msg){

    // Obtener el tiempo actual del video en segundos
    const currentTime = player.getCurrentTime();

    // Obtener la duración total del video en segundos
    let duration = player.getDuration();

    // Formatear el tiempo actual y la duración total en formato mm:ss
    const currentTimeFormatted = formatTime(currentTime, 2);
    const durationFormatted = formatTime(duration, 2);

    //El total del vídeo
    if(msg == "all"){
      panelTimeVideo.textContent = `${currentTimeFormatted}/${durationFormatted}`;
      getDurationFijaCompleta = `${durationFormatted}/${durationFormatted}`;
    }

    if(msg == "end"){
      blueProgressBar.style.width = "100%";
      iconoResumenB = false;
      iconoResumenF();
      panelTimeVideo.textContent = `${durationFormatted}/${durationFormatted}`;
    } else {
      if(!end){
        //No actualizar Time si se adelanta el vídeo
        if(procesando == null) return;
        panelTimeVideo.textContent = `${currentTimeFormatted}/${durationFormatted}`;
      }
    }
}


// Obtener el elemento HTML del panel de tiempo del video
const panelTimeVideo = document.getElementById('panel-time-video');
const blueProgressBar = document.querySelector('.ytp-progress-blue');
const progressBar = document.querySelector('.ytp-progress-green');

function actualizarTimeText(){

  if(dragVista) {
    actualizarTime();
    return;
  } 

  if(videoStatus) {
    // Obtener el tiempo actual del video en segundos
    const currentTime = player.getCurrentTime();

    // Obtener la duración total del video en segundos
    const duration = player.getDuration();

    actualizarTime();

    // ACTUALIZAR BARRA AZUL
    const progress = currentTime / duration;
    const progressPercent = progress * 100;

    if(procesando == null) return;
    blueProgressBar.style.width = `${progressPercent}%`;


    // ACTUALIZAR BARRA VERDE

    // Obtener el tamaño actual cargado del video
    const loaded = player.getVideoLoadedFraction() * duration;

    // Calcular el porcentaje de carga actual
    const percentageLoaded = loaded / duration * 100;

    // Actualizar el tamaño de la barra de carga verde para mostrar el progreso
    progressBar.style.width = `${percentageLoaded}%`;
  }
}

let tituloVideo = "";
let tituloNum = 0;
let tituloB = false;

function addTituloVideo(titulo, info){
  if(info == 0) {
    tituloB = true;
    videoTitle.style.opacity = "1";
    videoTitle.textContent = "" + titulo[tituloNum];
    tituloNum++;
  }

  setTimeout(()=>{
    if((videoTitle.textContent != titulo) && tituloB){
      videoTitle.textContent = videoTitle.textContent + titulo[tituloNum];
      tituloNum++;
      addTituloVideo(titulo, 1);
    }
    else tituloNum = 0;
  }, 5)
}


let tituloLoadingB = false;

function tituloLoading(info){

  if(info == 0) videoTitle.textContent = "|";

  setTimeout(()=>{
    if(!tituloB){
      if(videoTitle.style.opacity == "1") videoTitle.style.opacity = "0";
      else videoTitle.style.opacity = "1";
      tituloLoading(1);
    }
  }, 1000)

}

const videoTitle = document.getElementById("title-video");
tituloLoading(0);

const containerResumen = document.getElementById("container-svg-resumen");
const iconResumen = document.querySelectorAll(".svg-resumen");
let iconoResumenB = true;

function iconoResumenF(){
  if(iconoResumenB){
    iconoResumenB = false;
    iconResumen[1].style.display = "none";
    iconResumen[0].style.display = "block";
  }else{
    iconoResumenB = true;
    iconResumen[0].style.display = "none";
    iconResumen[1].style.display = "block";
  }
}

const containerAudio = document.getElementById("container-svg-audio");
const iconAudio = document.querySelectorAll(".svg-audio");
let iconoAudioB = true;

containerAudio.addEventListener("click", e =>{
  if(iconoAudioB){
    iconoAudioB = false;
    iconAudio[1].style.display = "none";
    iconAudio[0].style.display = "block";
    inputRange.value = 0;
    player.setVolume(0);

  }else{
    iconoAudioB = true;
    iconAudio[0].style.display = "none";
    iconAudio[1].style.display = "block";
    inputRange.value = inputValorGuardado;
    player.setVolume(inputValorGuardado);
  }
  e.stopPropagation();
})


const inputRange = document.querySelector(".inputRange");
let inputValorGuardado = 50;


inputRange.addEventListener("click", e =>{

  player.setVolume(inputRange.value);

  e.stopPropagation();
})



let on = false;
function onPlayerReady(event) {

  player.addEventListener('onDurationChange', function() {
    // Obtener la duración del video
    var duration = player.getDuration();
    console.log('Duración del video:', duration);
  });

  loginPlayer.status = "Conectado";
  socket.emit("changeStatus", "Conectado");
  audioNull = false;
  audioNullF();
  addTituloVideo(event.target.videoTitle, 0);
  videoReproducido = true;
  modelInferiorB = true;
  videoStatus = true;
  actualizarTime("all");
  modelInferior.style.transform = "translateY(0)";
  panelIcon.style.display = "block";
  panelIconB = true;
  videoB = true;

}

const urlButton = document.getElementById("Url-button");
const urlYoutube = document.getElementById("Url-Youtube");
const formUrlVideo = document.getElementById("form-url-video");

formUrlVideo.addEventListener("submit", e=>{
  e.preventDefault();

  fetch("/url", {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: urlYoutube.value })
      })
      .then(response => {
        response.text().
        then(res =>{

        if(res == "other") return;

        socket.emit("server-mensaje", "Han cambiado el vídeo");

        });
      })
      .catch(error => console.log("ocurrió un error")
  );
})


let personaje = null;
let numId = null;

const containerOnline = document.getElementById("container-online");
socket.on("onOnline", data =>{

  containerOnline.innerHTML = "";

  let documentFrag = document.createDocumentFragment();

  for (let i = 0; i < data.length; i++) {

    const person = document.createElement("DIV");
    person.classList.add("person");
    person.innerHTML = `name: ${data[i].name}<br>status: ${data[i].status}`;

    if((i + 1 == data.length) && numId == null) numId = data[i].num;

    if((numId == data[i].num) && numId != null) personaje = person;

    documentFrag.appendChild(person);
    
  }
  containerOnline.appendChild(documentFrag);
})

socket.on("player", ()=>{
  personaje.style.border = "1px solid white";
});

socket.on("entry", info=>{
  if((info == 0) && numId != 0) numId--;
})


let esperando = false;




function onPlayerStateChange(event) {


  if(event.data == 5){
    //Al cambiar vídeo esto se ejecuta dos veces, y en la segunda recibo correta la info del vídeo
    //Pero solo pasa si utilizo el método "cueVideoById" al cambiar el vídeo
    if(event.target.getDuration() > 0){
      getDurationFija = player.getDuration();
      actualizarTime("all");
      audioNull = false;
      audioNullF();
      loginPlayer.status = "Conectado";
      socket.emit("changeStatus", "Conectado");
      addTituloVideo(event.target.videoTitle, 0);
      panelIconB = true;
      videoReproducido = true;
      modelInferiorB = true;
      videoStatus = true;
      iconoResumenF();
      modelInferior.style.transform = "translateY(0)";
      panelIcon.style.display = "block";
      youtubeResumen.style.display = "none";
      youtubePause.style.display = "block";
      panelIcon.style.cursor = "pointer";
    }
  }

  if(event.data == 3) {
    videoReproducido = false;
    setTimeout(()=>{
      panelIcon.style.display = "none";
    }, 200)
  }

  if(event.data == 2){
    loginPlayer.status = "Vídeo pausado...";
    socket.emit("changeStatus", "Vídeo pausado...");
    videoReproducido = true;
    panelIconB = true;
    panelIcon.style.display = "block";
    panelIcon.style.cursor = "pointer";
    iconoResumenB = false;
    iconoResumenF();
  }

  if(event.data == 1) {
    if (procesando == null) procesando = setInterval(actualizarTimeText, 50);

    if(end){
      clearInterval(procesando);
      return;
    }

    loginPlayer.status = "Watch";
    socket.emit("changeStatus", "Watch");
    subStatus = true;
    videoOn = true;
    panelIcon.style.display = "none";
    panelIconB = false;
    iconoResumenB = true;
    iconoResumenF();
    videoReproducido = true;
    if(subIconB) activesubtitulo();
    else player.unloadModule('captions'); //Desactivar subtitulos automático por la cuenta de Youtube

  } else {
    clearInterval(procesando);
    procesando = null;
  }

  if(event.data == 0){
    loginPlayer.status = "Finalizado";
    socket.emit("changeStatus", "Finalizado");
    barraAzulFull();
    videoStatus = false;
    end = true;
    actualizarTime("end");
    panelIcon.style.display = "none";
    youtubeResumen.style.display = "none";
    youtubePause.style.display = "block";
    panelIcon.style.cursor = "pointer";
  }

// YT.PlayerState.UNSTARTED (-1): el reproductor está en estado no iniciado.
// YT.PlayerState.ENDED (0): el reproductor ha finalizado la reproducción.
// YT.PlayerState.PLAYING (1): el reproductor está reproduciendo un video.
// YT.PlayerState.PAUSED (2): la reproducción del reproductor está en pausa.
// YT.PlayerState.BUFFERING (3): el reproductor está cargando el video.
// YT.PlayerState.CUED (5): el video está en cola para su reproducción.


// YT.PlayerState.ENDED: El video ha terminado de reproducirse.
// YT.PlayerState.PLAYING: El video está actualmente en reproducción.
// YT.PlayerState.PAUSED: El video ha sido pausado.
// YT.PlayerState.BUFFERING: El video está actualmente en proceso de carga y no se está reproduciendo.
// YT.PlayerState.CUED: El video está en espera para ser reproducido.

}



// ------------------ Chat Online ------------------//

const enviarMensaje = document.querySelector(".enviarMensaje");
const chatMensaje = document.querySelector(".chat-messages");
const mensaje = document.getElementById("mensaje");

const containerMensaje = document.getElementById("container-mensaje");

containerMensaje.addEventListener("submit", event =>{

	event.preventDefault();

})


let contenidoMensajes = [];
let numMensajes = 0;

enviarMensaje.addEventListener("click", ()=>{

  if(mensaje.value.length < 1) return;

  socket.emit("mensaje", {msg: mensaje.value, num: numMensajes});

  const create = document.createElement("LI");
  create.textContent = loginPlayer.name + ": " + mensaje.value;
  create.classList.add("you");

  const msgPing = document.createElement("DIV");
  msgPing.classList.add("msg-ping");

  msgPing.num = numMensajes;

  create.appendChild(msgPing);

  contenidoMensajes.push({mensaje: msgPing, num: numMensajes});

  chatMensaje.appendChild(create);

  //Mediante introduzca más mensajes, el scroll irá hacía la parte inferior
  chatMensaje.scrollTop = chatMensaje.scrollHeight;

  mensaje.value = "";
  numMensajes++;


})

socket.on("mensaje-valid", (info)=>{

  for (let i = 0; i < contenidoMensajes.length; i++) {
    if(contenidoMensajes[i].num == info){
      contenidoMensajes[i].mensaje.parentElement.style.opacity = "1";
      contenidoMensajes[i].mensaje.style.background = "green";
    }
  }

  contenidoMensajes = contenidoMensajes.filter(res => res.num != info);
  numMensajes--;

})

socket.on("mensaje-you", info=>{

	const create = document.createElement("LI");
	create.textContent = info;
  create.classList.add("you");


	chatMensaje.appendChild(create);

	//Mediante introduzca más mensajes, el scroll irá hacía la parte inferior
	chatMensaje.scrollTop = chatMensaje.scrollHeight;

})

socket.on("mensaje-he", info=>{

  const create = document.createElement("LI");
  create.textContent = info;
  create.classList.add("he");


  chatMensaje.appendChild(create);

  chatMensaje.scrollTop = chatMensaje.scrollHeight;

})



socket.on("mensaje-it", info=>{

  const create = document.createElement("LI");
  create.textContent = info;
  create.classList.add("it");

  chatMensaje.appendChild(create);

  chatMensaje.scrollTop = chatMensaje.scrollHeight;

})


// ----------------------------------------------------------------------
socket.on("addVideo", url=>{

  if(player != undefined){
    loginPlayer.status = "Cargando video...";
    socket.emit("changeStatus", "Cargando vídeo...");

      blueProgressBar.style.width = 0;
      progressBar.style.width = 0;
      videoStatus = false;
      esperando = false;
      tituloB = false;
      videoOn = false;
      subStatus = false;
      subIconB = false;
      tituloB = false;
      iconoResumenB = false;
      end = false;

      modelInferiorB = false;
      modelInferior.style.transform = "translateY(30px)";
      velocidadesDesactivar();
      player.stopVideo();
      videoReproducido = false;
      modelInferior.style.transform = "translateY(30px)";
      tituloLoading(0);

      player.cueVideoById(url);

  } 
})