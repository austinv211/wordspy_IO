var Client = {};

Client.socket = io.connect();

Client.room = window.location.hash.substring(1);

Client.getPlayers = function (){
    Client.socket.emit('getPlayers', Client.room);
};

Client.askNewPlayer = function() {
    Client.socket.emit('newPlayer', Client.room);
}

Client.askNewPlayer();
Client.getPlayers();



