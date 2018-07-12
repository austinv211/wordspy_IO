var Client = {};

Client.socket = io.connect();

Client.playerName = window.localStorage.getItem("name");

Client.socket.on('connect', function() {
    console.log("my id " + Client.socket.id);
});

Client.room = window.location.hash.substring(1);


Client.team = null;

Client.setTeam = function(team){
    console.log(Client.playerName);
    Client.team = team;
    console.log("my team name is " + Client.team);
};

Client.getPlayers = function (){
    Client.socket.emit('getPlayers', Client.room);
};

Client.askNewPlayer = function(name) {
    Client.socket.emit('newPlayer', Client.playerName, Client.room);
};

Client.askNewPlayer();
Client.getPlayers();



