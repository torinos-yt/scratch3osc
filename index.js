const osc = require("node-osc");
const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({host : "127.0.0.1", port : 8080});

let oscServer = new osc.Server(4444);
let oscClient = new osc.Client("127.0.0.1", 4445);

let message = "";
let connection = [];

oscServer.on("message", (msg, rinfo) => {
	message = msg;
	connection.forEach(element => {
		element.send(msg.slice(2).join(','));
		//console.log("send : " + msg.slice(2).join(','));
	});
})

wss.on("connection", ws => {
	console.log("connect");
	connection.push(ws);
	ws.send(message);

	ws.on('close', function () {
        connection = connection.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });
	});

	ws.on("message", function (m) {
		const value = m.split(",");
		if(value[0] == "r_port"){
			oscServer._sock.close();
			oscServer = new osc.Server(Number(value[1]));
			console.log("new R_Port : " + value[1]);
			oscServer.on("message", (msg, rinfo) => {
				message = msg;
				connection.forEach(element => {
					element.send(msg.slice(2).join(','));
					//console.log("send : " + msg.slice(2).join(','));
				});
			})
		}else if(value[0] == "s_port"){
			oscClient._sock.close();
			oscClient = new osc.Client("127.0.0.1", Number(value[1]));
			console.log("new S_Port : " + value[1]);
		}else{
			const SendMsg = new osc.Message(value[0]);
			SendMsg.append(value[1]);
			oscClient.send(SendMsg);
		}
	})
})