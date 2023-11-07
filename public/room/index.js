const socket = io();

let WatchStatic = "";
let loginPlayer = null;

let on = false;

let identificador = "";

socket.on("start", (data)=>{

  identificador = data.username;
  if(data.video != undefined) WatchStatic = data.video;

})

socket.on("addUser", data=>{

  let documentFrag = document.createDocumentFragment();

  for (let index = 0; index < data.length; index++) {
    
    let createUsuario = document.createElement("DIV");
    createUsuario.classList.add("person");
    createUsuario.innerHTML = `name: ${data[index].username} <br> 
                                 status: ${data[index].status}`;

    
    if(data[index].username == identificador) {
      createUsuario.style.border = "1px solid #fff";
      createUsuario.style.order = "-1";
    } 
    else createUsuario.style.border = "1px solid #e59b3b";
    
    documentFrag.appendChild(createUsuario);
      
  }

  containerOnline.innerHTML = "";
  containerOnline.appendChild(documentFrag);

})

const containerOnline = document.getElementById("container-online");

let getDurationFija;
let getDurationFijaCompleta;

setInterval(function() {
  socket.emit('ping');
}, 5000); 


function barraAzulFull(){

    const currentTime = player.getCurrentTime();

    const duration = player.getDuration();

    const progress = currentTime / duration;
    const progressPercent = progress * 100;
    blueProgressBar.style.width = `${progressPercent}%`;

}


let modelInferior = document.getElementById("panel-inferior");
let modelInferiorB = false;


const videoVista = document.querySelector(".panel-control");
const tiempoAproximado = document.querySelector(".tiempoAproximado");


const panelCompleto = document.querySelector(".panel-completo");

modelInferior.addEventListener("mouseleave", e=>{
  e.stopPropagation();
  tiempoAproximado.style.display = "none";
})


panelCompleto.addEventListener("mouseenter", e=>{
  if(modelInferiorB){
    modelInferior.style.transform = "translateY(0)";
  }
})

panelCompleto.addEventListener("mouseleave", e=>{

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
    if(e.which == 3) return; 
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

    let duration = player.getDuration();


    const rect = videoVista.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const position = offsetX / rect.width;

    const time = duration * position;


    clearInterval(procesando);


    
    const progress = time / duration;
    const progressPercent = progress * 100;

    if(time + 1.5 >= player.getDuration()){
  
       socket.emit("sincronizar", {time: player.getDuration(), progressPercent: 100, tiempoAproximado: tiempoAproximado.textContent, end: "1"});
       end = true;
     
    } else  {
     
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

    tiempoAproximado.style.display = "none";

  })

  function formatTime(timeInSeconds, num) {
      let minutes;
      let seconds;
        
      if(num == 2){
         minutes = Math.floor(timeInSeconds / 60);
         seconds = Math.floor(timeInSeconds % 60);
         return `${minutes}:${(seconds < 10 ? '0' : '')}${seconds}`;
      }

  }



  function ytpAzulAndClick(e){

    let duration = player.getDuration();

    const rect = videoVista.getBoundingClientRect();

    const offsetX = e.clientX - rect.left;

    const position = offsetX / rect.width;

    const progressPercent = position * 100;

    if(dragClick){
      blueProgressBar.style.width = `${progressPercent}%`;
    }
  
    tiempoAproximado.style.left = `${progressPercent}%`;



    const time = Math.ceil(duration * position);

    let totalSegundo = Math.ceil(time);


    let currentTimeFormatted = formatTime(time, 2);
    let durationFormatted = formatTime(duration, 2);

     if(totalSegundo >= duration){
       tiempoAproximado.textContent = `${durationFormatted}/${durationFormatted}`;
       return;
     } else if(totalSegundo <= 0){
       tiempoAproximado.textContent = `0:00/${durationFormatted}`;
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
  
  player = new YT.Player('player', {
  
    videoId: WatchStatic != "" ? WatchStatic : 'XAFreTjJr6k',
      playerVars: {
  
              showinfo: 1,
              rel: 1,
              controls: 0
  
            },
      events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onError
      }
  });
}



function onPlayerReady(event) {

  on = true;
  socket.emit("modifier", "Conectado");
  audioNull = false;
  audioNullF();
  tituloNum = 0;
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


function onPlayerStateChange(event) {


  if(event.data == 5){
    if(event.target.getDuration() > 0){

      on = true;

      getDurationFija = player.getDuration();
      actualizarTime("all");
      audioNull = false;
      audioNullF();

      socket.emit("modifier", "Conectado");

      tituloNum = 0;
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

    socket.emit("modifier", "Video pausado...");
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

    socket.emit("modifier", "Watch");

    subStatus = true;
    videoOn = true;
    panelIcon.style.display = "none";
    panelIconB = false;
    iconoResumenB = true;
    iconoResumenF();
    videoReproducido = true;
    if(subIconB) activesubtitulo();
    else player.unloadModule('captions');

  } else {
    clearInterval(procesando);
    procesando = null;
  }

  if(event.data == 0){
    socket.emit("modifier", "Finalizado");
    barraAzulFull();
    videoStatus = false;
    end = true;
    actualizarTime("end");
    panelIcon.style.display = "none";
    youtubeResumen.style.display = "none";
    youtubePause.style.display = "block";
    panelIcon.style.cursor = "pointer";
  }

}



function onError(event) {

  if(event.data == 150){
    on = true;
    socket.emit("modifier", "Esperando...");
    panelIcon.style.display = "none";
    containerError.style.display = "block";
    mensajeError.style.transform = "translateY(0)";
  }

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


}

function disableSubtitles() {
  subIconB = false;
  player.unloadModule('captions');

  document.querySelector(".path-sub").style.fill = "#fff";
  document.querySelector(".path-sub").opacity = 1;
}

subIcon.addEventListener("click", e =>{

  if(!audioNull){
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




const elemento = document.querySelector('.container-video');
const fullScreen = document.querySelector(".path-screen");
const containerScreen = document.getElementById("container-screen");

function exitHandler() {
  if (!document.fullscreenElement) {
    fullScreen.style.fill = "#fff";
  }
}

document.addEventListener("fullscreenchange", exitHandler);
document.addEventListener("webkitfullscreenchange", exitHandler);
document.addEventListener("mozfullscreenchange", exitHandler);
document.addEventListener("MSFullscreenChange", exitHandler);

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    fullScreen.style.fill = "#3A75F0";
    if (elemento.requestFullscreen) {
      elemento.requestFullscreen();
    } else if (elemento.webkitRequestFullscreen) {
      elemento.webkitRequestFullscreen();
    } else if (elemento.msRequestFullscreen) {
      elemento.msRequestFullscreen();
    } else if (elemento.mozRequestFullScreen) {
      elemento.mozRequestFullScreen();
    }
  } else {
    fullScreen.style.fill = "#fff";
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
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


var getCurrentTimeButton = document.getElementById("boton");
var sincronizar = document.getElementById("sincronizar");
var videoB = false;


socket.on("sincronizar", info=>{

  clearInterval(procesando);
  procesando = null;

  player.seekTo(info.time);

  blueProgressBar.style.width = `${info.progressPercent}%`;


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

    const currentTime = player.getCurrentTime();

    let duration = player.getDuration();
 
    const currentTimeFormatted = formatTime(currentTime, 2);
    const durationFormatted = formatTime(duration, 2);

  
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
        if(procesando == null) return;
        panelTimeVideo.textContent = `${currentTimeFormatted}/${durationFormatted}`;
      }
    }
}


const panelTimeVideo = document.getElementById('panel-time-video');
const blueProgressBar = document.querySelector('.ytp-progress-blue');
const progressBar = document.querySelector('.ytp-progress-green');

function actualizarTimeText(){

  if(dragVista) {
    actualizarTime();
    return;
  } 

  if(videoStatus) {

    const currentTime = player.getCurrentTime();

    const duration = player.getDuration();

    actualizarTime();

    const progress = currentTime / duration;
    const progressPercent = progress * 100;

    if(procesando == null) return;

    if(!dragClick) blueProgressBar.style.width = `${progressPercent}%`;

    const loaded = player.getVideoLoadedFraction() * duration;

    const percentageLoaded = loaded / duration * 100;

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
    inputValorGuardado = inputRange.value;
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
  inputValorGuardado = inputRange.value;

  e.stopPropagation();
});

inputRange.addEventListener("input", e =>{

  player.setVolume(inputRange.value);

});




const urlButton = document.getElementById("Url-button");
const urlYoutube = document.getElementById("Url-Youtube");
const formUrlVideo = document.getElementById("form-url-video");

formUrlVideo.addEventListener("submit", e=>{
  e.preventDefault();

  if(on == false) return;

  socket.emit("requestVideoChange", urlYoutube.value);


})


let personaje = null;
let numId = null;


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
  create.textContent = identificador + ": " + mensaje.value;
  create.classList.add("you");

  const msgPing = document.createElement("DIV");
  msgPing.classList.add("msg-ping");

  msgPing.num = numMensajes;

  create.appendChild(msgPing);

  contenidoMensajes.push({mensaje: msgPing, num: numMensajes});

  chatMensaje.appendChild(create);

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


socket.on("cleanForm", ()=>{
  urlYoutube.value = "";
})


// ----------------------------------------------------------------------
socket.on("addVideo", url=>{

  if(player != undefined && on == true){
    socket.emit("modifier", "Cargando vídeo...");

      on = false;
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