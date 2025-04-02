import express from "express";
import http from "node:http";
import {Server as ServerSocket} from "socket.io";

// Get URL Random
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

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

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

	let uuidURL = uuidv4();

	if(!roomOn.includes(uuidURL)){
		roomOn.push(uuidURL);
	}

	if(req.cookies.following != undefined){

		if(roomOn.includes(req.cookies.following)){
			res.cookie("following", "000", { expires: new Date() });
			res.redirect(`room/${req.cookies.following}`);
		} else {
			res.cookie("following", "000", { expires: new Date() });
			res.redirect(`room/${uuidURL}`);
		}

	} else {
		console.log("Sala activada: " + uuidURL)
		res.redirect(`room/${uuidURL}`);
	}
})

app.get(`/room/:roomID`, (req, res)=>{
	//Join to the room created

	// console.log(req.cookies.username);

	if(req.cookies.username == undefined){

		res.cookie("following", req.params.roomID)
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


io.on('connection', (socket)=>{

	let cookieSocket = socket.handshake.headers.cookie.split(";");
	let videoplayback;

	// console.log(cookieSocket);
	
	userInfo.push({
		socket,
		username: cookieSocket[0].split("=")[1],
		room: cookieSocket[1].split("=")[1],
		status: "Conectando"
	});

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

	socket.emit("reconnect", videoURL);

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

	socket.on("videoChanged", (info)=>{

		let userEmit = userInfo.find(res => res.socket.id == socket.id);

		let roomListen = userInfo.filter(res => res.room == userEmit.room);

		let autor = userEmit.username;

		roomListen.forEach(res => {
			res.socket.emit("mensaje-it", `${autor} cambió el vídeo`);
		})

	});

	socket.on("sincronizar", info=>{

		let userEmit = userInfo.find(res => res.socket.id == socket.id);

		let roomListen = userInfo.filter(res => res.room == userEmit.room);

		let autor = userEmit.username;

		roomListen.forEach(res => {
			io.emit("sincronizar", info);
			io.emit("mensaje-it", `${autor} sincronizó el vídeo`);
		})
	})


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

		let availableChange = roomListen.every(res => res.status != "Conectando" && res.status != "Cargando vídeo...")

		console.log("El cambio es: " + availableChange);
		if(availableChange) {
			roomVideo.push({room: userListen.room, video: nuevaURL})
			roomListen.forEach(res => res.socket.emit("addVideo", nuevaURL));
			socket.emit("cleanForm");
		}
	})
})

