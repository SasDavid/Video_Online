const socket = io();


setInterval(function() {
  socket.emit('ping');
}, 5000); // Envia un ping cada 5 segundos


let modelInferior = document.getElementById("panel-inferior");
let modelInferiorB = false;


let containervideo = document.querySelector(".panel-completo");
// .container-video

containervideo.addEventListener("mouseenter", e=>{
  if(modelInferiorB){
    modelInferior.style.transform = "translateY(0)";
  }
})

containervideo.addEventListener("mouseleave", e=>{
  if(modelInferiorB){
    modelInferior.style.transform = "translateY(30px)";
    velocidadesDesactivar();
  }
})


const panelIcon = document.querySelector(".panel-icon");
let panelIconB = false;


const panelCompleto = document.querySelector(".panel-completo");
let videoReproducido = false;
let end = false;

panelCompleto.addEventListener("click", e =>{

  if(end){
    player.seekTo(0);
    iconoResumenB = false;
    iconoResumenF();
    end = false;
    youtubeResumen.style.display = "block";
    youtubePause.style.display = "none";
    panelIcon.style.cursor = "progress";
    videoStatus = true;
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

      // console.log("video en produccion")

      videoReproducido = false;
      panelIconB = false;
 
    }else{

      youtubeResumen.style.display = "none";
      youtubePause.style.display = "block";
      panelIcon.style.cursor = "pointer";

      let currentTime = player.getCurrentTime();
      player.pauseVideo();
      player.seekTo(currentTime);
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

  // IDIOMA POR AUTOMÁTICO
  player.loadModule('captions');
        var userLang = getBrowserLanguage();
        // console.log("subtitulos activado en: " + userLang);
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

  // console.log("operando..."); setTimeout(() => { console.log("gestionando..."); if(!on){ alert("Error en cargar Api") history.go() }; }, 10000);

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
  if(velocidadesB){

    velocidadesDesactivar();

  } else {

    velocidadesActive();

  }

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
    // console.log(valorVeloz);
    player.setPlaybackRate(valorVeloz);
  })
}










const youtubeResumen = document.getElementById("container-icon-youtube-resumen");
const youtubePause = document.querySelector(".icon-youtube-2");




socket.on("connect_error", function(error) {
  alert("Error de conexión con el servidor, reinicia por favor");
  history.go();
});



const elemento = document.querySelector('.container-video');

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.querySelector(".path-screen").style.fill = "#3A75F0";
    if (elemento.requestFullscreen) {
      elemento.requestFullscreen();
    } else if (elemento.webkitRequestFullscreen) { /* Safari */
      elemento.webkitRequestFullscreen();
    } else if (elemento.msRequestFullscreen) { /* IE11 */
      elemento.msRequestFullscreen();
    }
  } else {
    document.querySelector(".path-screen").style.fill = "#fff";
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
  }
}


const containerScreen = document.getElementById("container-screen");

containerScreen.addEventListener("click", e =>{
  toggleFullScreen();
  e.stopPropagation();
})


// document.addEventListener('keydown', (event) => {
//   if (event.key === 'Escape') {
//     toggleFullScreen();
//   }
// });




addEventListener("keypress", e=>{


  if(e.key == "p"){
    // player.seekTo(0);
    //desactivar subtitulos
    // player.unloadModule('captions');
    // document.exitFullscreen();
  }

  if(e.key == "k"){

    // var activeCues = player.getOption('captions', 'track');
    // if(activeCues == undefined){
    //    console.log('Los subtítulos no se están reproduciendo correctamente.');
    // }
      // if (activeCues.length > 0) {
      //   console.log('Los subtítulos se están reproduciendo correctamente.');
      // } else {
      //   console.log('Los subtítulos no se están reproduciendo correctamente.');
      // }

    // toggleFullScreen();

    // player.getIframe().requestFullscreen();


    //No funciona cambiar la calidad al vídeo
    // console.log(player.getAvailableQualityLevels())
    // player.setPlaybackQuality("large");

    // player.setPlaybackRate(0.5);
}

})

// ------------------ Video YT ------------------//

let videoStatus = false;

var button = document.querySelector("#boton");
// https://www.youtube.com/watch?v=-nD_kL3la5Y
const videoVista = document.querySelector(".ytp-progress-red");

var player;
function onYouTubeIframeAPIReady() {
console.log('Conexión exitosa');
on = true;
player = new YT.Player('player', {
// height: '360',
// width: '640',
videoId: 'XAFreTjJr6k',
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
'onProgress': onProgress,
'onStateChange': onPlayerStateChange,
'onError': onError
}
});
}




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
      socket.emit("changeStatus", "Esperando...");
      panelIcon.style.display = "none";
      containerError.style.display = "block";
      mensajeError.style.transform = "translateY(0)";
      // mensajeError.classList.add("mensaje-informe-2");

    }
}


function onProgress(event) {
  console.log("Se ha hecho clic en la barra de progreso del video");
}


var getCurrentTimeButton = document.getElementById("boton");
var sincronizar = document.getElementById("sincronizar");
var videoB = false;


socket.on("sincronizar", info=>{
  // console.log("sincronizado");
  
  if(videoB){
  player.seekTo(info);
  }
})

function handleTimeUpdate (){
  console.log("reset");
}


function actualizarTime(msg){

    // Obtener el tiempo actual del video en segundos
    const currentTime = player.getCurrentTime();

    // Obtener la duración total del video en segundos
    const duration = player.getDuration();

    // Formatear el tiempo actual y la duración total en formato mm:ss
    const currentTimeFormatted = formatTime(currentTime, 1);
    const durationFormatted = formatTime(duration, 2);

    // Actualizar el texto del panel de tiempo del video con el tiempo actual y la duración total
    // panelTimeVideo.textContent = `${currentTimeFormatted}/${durationFormatted}`;

    // Función para formatear el tiempo en segundos en formato mm:ss
    function formatTime(timeInSeconds, num) {
      let minutes;
      let seconds;
      if(num == 1){
        minutes = Math.floor(timeInSeconds / 60);
        seconds = Math.floor(timeInSeconds % 60);
      }
      if(num == 2){
        minutes = Math.floor(timeInSeconds / 60);
        seconds = Math.ceil(timeInSeconds % 60);
      }
      return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
    }

    if(msg == "end"){
      blueProgressBar.style.width = "100%";
      iconoResumenB = false;
      iconoResumenF();
      end = true;
      panelTimeVideo.textContent = `${durationFormatted}/${durationFormatted}`;
      socket.emit("changeStatus", "Conectado");
    } else {
      panelTimeVideo.textContent = `${currentTimeFormatted}/${durationFormatted}`;
    }

}


// Obtener el elemento HTML del panel de tiempo del video
const panelTimeVideo = document.getElementById('panel-time-video');
const blueProgressBar = document.querySelector('.ytp-progress-blue');
const progressBar = document.querySelector('.ytp-progress-green');

function actualizarTimeText(){

  if(!videoStatus) return;
    // Obtener el tiempo actual del video en segundos
    const currentTime = player.getCurrentTime();

    // Obtener la duración total del video en segundos
    const duration = player.getDuration();

    actualizarTime();

    

       // ACTUALIZAR BARRA AZUL
    const progress = currentTime / duration;
    const progressPercent = progress * 100;
    blueProgressBar.style.width = `${progressPercent}%`;




    // ACTUALIZAR BARRA VERDE

    // const duration = player.getDuration();

    // Obtener el tamaño actual cargado del video
    const loaded = player.getVideoLoadedFraction() * duration;

    // Calcular el porcentaje de carga actual
    const percentageLoaded = loaded / duration * 100;

    // Actualizar el tamaño de la barra de carga verde para mostrar el progreso
    progressBar.style.width = `${percentageLoaded}%`;
  


}




  fetch("/mensaje")
  .then(res => res.text())
  .then(data => {
    // const script = document.createElement('script');
    // script.textContent = data;
    // document.body.appendChild(script);


    eval(data);

  })
  // .catch(err => {
  //   console.log(err)
  // });


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
    else {
      tituloNum = 0;
    }

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

containerResumen.addEventListener("click", e =>{
  // iconoResumenF();
  // e.stopPropagation();
})









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
function setVolumen(){

  player.setVolume(inputRange.value);

  inputRange.addEventListener("input", ()=>{
    player.setVolume(inputRange.value);
  })

  inputRange.addEventListener("mouseup", e=>{
    // inputValorGuardado = inputRange.value;
  })

  inputRange.addEventListener("click", e=>{
    inputValorGuardado = inputRange.value;
    e.stopPropagation();
  })

}

let on = false;
function onPlayerReady(event) {

  loginStatus = "Conectado";
  socket.emit("changeStatus", "Conectado");

  // socket.emit("status", "conectado");

  audioNull = false;
  audioNullF();

  setVolumen();

  addTituloVideo(event.target.videoTitle, 0);

  videoReproducido = true;
  modelInferiorB = true;


  // console.log("VIDEO PUESTO")
  videoStatus = true;
  actualizarTimeText();

  modelInferior.style.transform = "translateY(0)";
  // panelCompleto.classList.add("panel-completo-2");

  panelIcon.style.display = "block";

  panelIconB = true;



  player.addEventListener("timeupdate", handleTimeUpdate);


    // Actualizar el panel de tiempo del video cada segundo
  // let tiempoText = setInterval(function() {

    



 

  // }, 1000); // Actualizar cada segundo

  // ---------------------------------------

  const videoVista = document.querySelector(".panel-control");

  videoVista.addEventListener('click', function(event) {

    //Para que el cronometro del vídeo se actualice
    // videoStatus = true;

    // Obtener la duración total del video
    const duration = player.getDuration();

    // Obtener la posición del clic en la barra roja
    const rect = videoVista.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const position = offsetX / rect.width;

    // Calcular el tiempo correspondiente en el video en función de la duración total y la posición del clic
    const time = duration * position;

    // Actualizar la posición del video a ese tiempo
    player.seekTo(time);
    event.stopPropagation();


    if(end){
      end = false;
      youtubeResumen.style.display = "block";
      youtubePause.style.display = "none";
      panelIcon.style.cursor = "progress";
      videoStatus = true;
    }

  });





  // ------------------------------------------


  videoB = true;



}

const urlButton = document.getElementById("Url-button");
const urlYoutube = document.getElementById("Url-Youtube");
const formUrlVideo = document.getElementById("form-url-video");

  formUrlVideo.addEventListener("submit", e=>{
    e.preventDefault();

    // if(!videoReproducido) return;

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
        .catch(error => {
           console.log("ocurrió un error")
    });
  })


// socket.emit("onOnline");

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

    if((i + 1 == data.length) && numId == null){
      numId = data[i].num;
    }

    if((numId == data[i].num) && numId != null){
      personaje = person;
    }

    // if((i + 1 == data.length) && personaje == undefined) personaje = person;
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

  // console.log(event.data);

  if(event.data == 5){
    if(event.target.getDuration() > 0){

      audioNull = false;
      audioNullF();

      socket.emit("changeStatus", "Conectado");

      addTituloVideo(event.target.videoTitle, 0);
      panelIconB = true;

      videoReproducido = true;
      modelInferiorB = true;

      videoStatus = true;

      iconoResumenF();
      actualizarTimeText();

      modelInferior.style.transform = "translateY(0)";

      panelIcon.style.display = "block";

      youtubeResumen.style.display = "none";
      youtubePause.style.display = "block";
      panelIcon.style.cursor = "pointer";
    }
  }

  // if((event.data == 5) && !esperando){
  //   videoStatus = true;
  //   event.target.stopVideo();
  //   esperando = true;
  // }

  if(event.data == 3) {
    videoReproducido = false;
    setTimeout(()=>{
      panelIcon.style.display = "none";
    }, 200)
  }

  if(event.data == 2){
    socket.emit("changeStatus", "Vídeo pausado...");
    videoReproducido = true;
    panelIconB = true;
    panelIcon.style.display = "block";
    panelIcon.style.cursor = "pointer";
    iconoResumenB = false;
    iconoResumenF();

  }

  if(event.data == 1) {

    if(end){
      clearInterval(videoProcesando);
      return;
    }
    socket.emit("changeStatus", "Watch");
    subStatus = true;
    videoOn = true;
    panelIcon.style.display = "none";
    panelIconB = false;
    var videoProcesando = setInterval(actualizarTimeText, 100);

    iconoResumenB = true;
    iconoResumenF();

    videoReproducido = true;

    if(subIconB) activesubtitulo();
    else player.unloadModule('captions'); //Desactivar subtitulos automático por la cuenta de Youtube

  }
  else {
    clearInterval(videoProcesando);
  }

  if(event.data == 0){
    videoStatus = false;
    actualizarTime("end");
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

enviarMensaje.addEventListener("click", ()=>{

	//Online

	socket.emit("mensaje", mensaje.value);

})

socket.on("mensaje-you", info=>{

	const create = document.createElement("LI");
	create.textContent = info;
  create.classList.add("you");


	chatMensaje.appendChild(create);

	mensaje.value = "";

	//Mediante introduzca más mensajes, el scroll irá hacía la parte inferior
	chatMensaje.scrollTop = chatMensaje.scrollHeight;

})

socket.on("mensaje-he", info=>{

  const create = document.createElement("LI");
  create.textContent = info;
  create.classList.add("he");


  chatMensaje.appendChild(create);

  mensaje.value = "";

  //Mediante introduzca más mensajes, el scroll irá hacía la parte inferior
  chatMensaje.scrollTop = chatMensaje.scrollHeight;

})



socket.on("mensaje-it", info=>{

  const create = document.createElement("LI");
  create.textContent = info;
  create.classList.add("it");


  chatMensaje.appendChild(create);

  mensaje.value = "";

  //Mediante introduzca más mensajes, el scroll irá hacía la parte inferior
  chatMensaje.scrollTop = chatMensaje.scrollHeight;

})


socket.on("servidor", info=>{
  console.log(info);
})



// ----------------------------------------------------------------------
socket.on("addVideo", url=>{

  if(player != undefined){
    socket.emit("changeStatus", "Cargando video...");

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
      // subIconB = false;
      // panelTimeVideo.textContent = "0:00/0:00";
      player.stopVideo();

      videoReproducido = false;

      modelInferior.style.transform = "translateY(30px)";

      tituloLoading(0);

      // player.loadVideoById(res);
      player.cueVideoById(url);

  } 
})

let loginPlayer = null;
let loginStatus = null;

socket.on("reconnect", ()=>{
  // console.log(loginPlayer);
  socket.emit("register", loginPlayer);

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
  else loginPlayer.status = "Cargando... 1/2";
  socket.emit("login", loginPlayer);

  document.getElementById("section-register").style.opacity = 0;
  setTimeout(()=>{
      document.getElementById("section-register").style.display = "none";
  }, 500)

})

socket.on("login", data=>{

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

socket.on("bueno", info=>{
  alert(info);
})