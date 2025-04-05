import express from "express";
import http from "node:http";
import {Server as ServerSocket} from "socket.io";
import { v4 as uuidv4 } from 'uuid';

// Get __dirname
import path from 'node:path';
import url from 'node:url';

// Get Cookies
import cookieParser from 'cookie-parser';

const app = express();
const server = http.createServer(app);
const io = new ServerSocket(server);

const PORT = process.env.PORT ?? 7050;


let roomOn = [];
let roomVideo = [];
let userInfo = [];

app.use(express.json());
app.use(express.text());

app.use(express.static('public'));

app.use(cookieParser());

let videoURL = "";
let nuevaURL = "";

// const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const __dirname = import.meta.url;
console.log(import.meta.url)

// const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

//start server
server.listen(PORT, ()=>{
	console.log("Servidor Iniciado");
});


app.get("/sala", (req, res)=>{
	console.log("Welcome a la sala");
	res.redirect("salaOculta");
	res.sendFile(__dirname, "salita.html");
})

app.get("/salaOculta", (req, res)=>{
	res.sendFile(__dirname, "salaOculta", "index.html")
})



app.post(`/roomCreate`, (req, res)=>{
	//Create a room

	res.cookie('username', req.body, { httpOnly: true });

	// Entrar a una por invitacion
	if(req.cookies.invited != undefined){
		if(roomOn.includes(req.cookies.invited)){
			res.cookie("invited", "", { expires: new Date() })
			.redirect(`room/${req.cookies.invited}`)
		}
	} else {
		// Crear una sala

		let uuidURL = uuidv4();

		if(!roomOn.includes(uuidURL)){
			roomOn.push(uuidURL);
			res.redirect(`room/${uuidURL}`);
			return;
		}
	}
	

})

app.get(`/room/:roomID`, (req, res)=>{
	//Join to a room

	// Entrando a una sala sin haberse logeado
	if(req.cookies.username == undefined){

		res.cookie("invited", req.params.roomID)
		res.redirect("/");
		return;

	}

	if(roomOn.includes(req.params.roomID)){
		console.log(req.params.roomID);
		res.cookie('room', req.params.roomID, { httpOnly: true });
		res.sendFile(path.join(__dirname, "public", "room", "index.html"));
	} 
	else {
		res.redirect("/");
	}

})

// app.post("/login-room", (req, res)=>{
// 	console.log(req.cookies)
// })


io.on('connection', (socket)=>{

	let cookieSocket = socket.handshake.headers.cookie.split(";");
	let videoplayback;

	let username, room;

	for(let element of cookieSocket){
		if(element.split("=")[0] == "username"){
			username = element.split("=")[1]
		} else if(element.split("=")[0] == "room"){
			room = element.split("=")[1]
		}
	}
	
	userInfo.push({
		socket,
		username,
		room,
		status: "Conectando"
	});

	let roomUsersName = userInfo.map(res => {
		return {
			username: res.username,
			status: res.status
		}
	});


	userInfo.forEach(element => {
		element.socket.emit("addUser", roomUsersName)
	})



	if(roomVideo.length > 0){

		videoplayback = roomVideo.find(res => {
			if(res.room == cookieSocket[1].split("=")[1]){
				return true;
			}
		})
	}

	if(videoplayback != undefined){

		socket.emit("start", {
			username: cookieSocket[0].split("=")[1],
			video: videoplayback.video ?? ""
		});

	} else {
		socket.emit("start", {
			username: cookieSocket[0].split("=")[1]
		});
	}

	// Modificar el status del usuario o agregar un usuario
	socket.on("modifier", (data)=>{

		//Encontrar el usuario para el cambio
		let modifierUser = userInfo.find(res => res.socket.id == socket.id);

		//Encontrar el index del usuario
		let getIndex = userInfo.findIndex(res => res.socket.id == socket.id);
		//Modificar valor del usuario
		userInfo[getIndex].status = data;

		//Reagrupar a los usuarios en la misma room
		let roomListen = userInfo.filter(res => res.room == modifierUser.room);

		const roomUsersName	= roomListen.map(res => {
			return {
				username: res.username,
				status: res.status
			}
		});

		roomListen.forEach(client => {
			
			client.socket.emit("addUser", roomUsersName);
			
		})
	});

	// socket.emit("reconnect", videoURL);

	socket.on("changeStatus", data=>{

		for (let i = 0; i < usuariosRegister.length; i++) {
			if(socket == usuariosRegister[i].id){
				usuariosRegister[i].status = data;
			}
		}

		io.emit("login", usuariosClient());

	})

	console.log("Unido al servidor", socket.id);


  socket.on('disconnect', () => {

	userInfo = userInfo.filter(element => element.socket.id != socket.id);

	const roomUsersName	= userInfo.map(res => {
		return {
			username: res.username,
			status: res.status
		}
	});

	userInfo.forEach(client => {
		
		client.socket.emit("addUser", roomUsersName);
		
	})

  });

	socket.on("mensaje", (info)=>{

		if(info.msg.length < 1) return;

		let autor = userInfo.filter(res => res.socket.id == socket.id);

		let sortListen = userInfo.filter(res => res.room == autor[0].room && res.socket.id != socket.id);

		socket.emit("mensaje-valid", info.num);


		sortListen.forEach(res => {
			socket.broadcast.emit("mensaje-he", `${autor[0].username + ": " + info.msg}`);
		})
	
	});

	// Mensaje de cambio el video
	socket.on("videoChanged", (info)=>{

		let userEmit = userInfo.find(res => res.socket.id == socket.id);

		let roomListen = userInfo.filter(res => res.room == userEmit.room);

		let autor = userEmit.username;

		roomListen.forEach(res => {
			res.socket.emit("mensaje-it", `${autor} cambió el vídeo`);
		})

	});

	// Sincronizar el video
	socket.on("sincronizar", info=>{

		let userEmit = userInfo.find(res => res.socket.id == socket.id);

		userInfo.forEach(res => {
			res.socket.emit("sincronizar", info);
			res.socket.emit("mensaje-it", `${userEmit.username} sincronizó el vídeo`);
		})

	})

	// Cambiar el video
	socket.on("requestVideoChange", (data) =>{

		const str = data;

		let lastIndex = str.indexOf("v=");

		nuevaURL = str.slice(lastIndex + 2, lastIndex + 2 + 11);

		if(lastIndex == -1){
			lastIndex = str.indexOf("s/");
			nuevaURL = str.slice(lastIndex + 2, lastIndex + 2 + 11);
			console.log(nuevaURL);
		}
	
		if(lastIndex == -1){
			lastIndex = str.indexOf("e/");
			nuevaURL = str.slice(lastIndex + 2, lastIndex + 2 + 11);
			console.log(nuevaURL);
		}
	
		if(lastIndex == -1) return;
	
	
		let userListen = userInfo.find(res => res.socket.id == socket.id);

		let roomListen = userInfo.filter(res => res.room == userListen.room);

		let availableChange = roomListen.every(res => res.status != "Cargando vídeo...")

		console.log("El cambio es: " + availableChange);
		if(availableChange) {
			roomVideo.push({room: userListen.room, video: nuevaURL})
			roomListen.forEach(res => res.socket.emit("addVideo", nuevaURL));
			socket.emit("cleanForm");
		}
	})
})

