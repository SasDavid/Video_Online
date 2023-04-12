const express = require("express");
const app = express();

const path = require("path");
const request = require("request");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());





//settings
app.set("port", process.env.PORT || 7050);


//static files
app.use(express.static(path.join(__dirname + '/public')));
console.log(__dirname + "/public")




let onOnlineId = [];
let onNum = 0;
let nuevaEntrada = [];
let videoURL = "";
let nuevaURL = "";
//start server
const server = app.listen(app.get("port"), ()=>{
	onOnlineId = [];
	onNum = 0;
	nuevaEntrada = [];
	console.log("Servidor Iniciado");
});



//WebSocket

const SocketIO = require("socket.io");
const io = SocketIO(server);






let usuariosRegister = [];
let usuarios = [];

function usuariosClient (){

	usuarios = [];

	for (let i = 0; i < usuariosRegister.length; i++) {
		usuarios.push({name: usuariosRegister[i].name, status: usuariosRegister[i].status});
	}

	return usuarios;
}


io.on('connection', (socket)=>{




	socket.emit("reconnect", videoURL);

	socket.on("actualizando", data=>{

		if(data == null){
			socket.emit("register");
			return;
		} else {

			for (let i = 0; i < usuariosRegister.length; i++) {
				if(usuariosRegister[i].socket == socket){
					return;
				}
			}

			usuariosRegister.push({name: data.name, clave: data.clave, status: data.status, id: socket});
			io.emit("login", usuariosClient());
		}

		return;

		//Si no hay registro, registra este
		if(usuariosRegister.length < 1){
			usuariosRegister.push({name: data.name, clave: data.clave, status: data.status, id: socket});
			io.emit("login", usuariosClient());
		} else { //Si hay registros, busca uno con estas datas y aplicalas para la reconexión
			for (let i = 0; i < usuariosRegister.length; i++) {
				if(usuariosRegister[i].clave == data.clave){
					usuariosRegister[i].id = socket;
				}
			}

			usuariosRegister.push({name: data.name, clave: data.clave, status: data.status, id: socket});
			io.emit("login", usuariosClient());
		}
		
	})

	socket.on("login", data=>{
		for (let i = 0; i < usuariosRegister.length; i++) {
			if(socket == usuariosRegister[i].socket) return;
		}

		if(data.name.length > 8) return;
		console.log(data);


		for (let i = 0; i < usuariosRegister.length; i++) {
			if(usuariosRegister[i].socket == socket){
				return;
			}
		}

		usuariosRegister.push({name: data.name, clave: data.clave, status: data.status, id: socket});
		io.emit("login", usuariosClient());
	})

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

  	let arraySalida = usuariosRegister.filter(res => res.id != socket);
  	usuariosRegister = arraySalida;
  	io.emit("login", usuariosClient());

  	return;

  });

	socket.on("mensaje", (info)=>{

		let autor = "";

		for (let i = 0; i < usuariosRegister.length; i++) {
			if(socket == usuariosRegister[i].id){
				autor = usuariosRegister[i].name;
			}
		}

		if(info.msg.length > 0) {
			socket.broadcast.emit("mensaje-he", `${autor + ": " + info.msg}`);
			
			socket.emit("mensaje-valid", info.num);
			
		}	
	});

	socket.on("server-mensaje", (info)=>{

		let autor = "";

		for (let i = 0; i < usuariosRegister.length; i++) {
			if(socket == usuariosRegister[i].id){
				autor = usuariosRegister[i].name;
			}
		}

		if(info.length > 0) {
			if(info == "Han cambiado el vídeo") io.emit("mensaje-it", `${autor} cambió el vídeo`);
		}	
	});

	socket.on("sincronizar", info=>{

		let autor = "";

		for (let i = 0; i < usuariosRegister.length; i++) {
			if(socket == usuariosRegister[i].id){
				autor = usuariosRegister[i].name;
			}
		}

		io.emit("sincronizar", info);
		io.emit("mensaje-it", `${autor} sincronizó el vídeo`);
	})
})


app.post("/url", (req, res) =>{

	const str = req.body.data;
	// DEBO HACER QUE ENCUENTRE EL PRIMER v=
	let lastIndex = str.indexOf("v=");
	// const subStr = str.slice(lastIndex);
	nuevaURL = str.slice(lastIndex + 2, lastIndex + 2 + 11);

	// console.log(lastIndex);

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

	if(nuevaURL != videoURL){

		for (let i = 0; i < usuariosRegister.length; i++) {
			if(((((usuariosRegister[i].status != "Conectado")
			&& usuariosRegister[i].status != "Esperando...")
			&& usuariosRegister[i].status != "Watch")
			&& usuariosRegister[i].status != "Vídeo pausado...")
			&& usuariosRegister[i].status != "Finalizado") return;
		}

		videoURL = nuevaURL;
		io.emit("addVideo", videoURL);
		res.send("Accept");
	} else {
		console.log("other");
		res.send("other")
	}
	// console.log(subStr); // "Mundo!"
})