//Client variable
var Client = {};

//set the socket to io.connect 
Client.socket = io.connect();

//set the player name to the value from local storage
Client.playerName = window.localStorage.getItem("name");

//function on what to do on connect function
Client.socket.on('connect', function() {
    console.log("my id " + Client.socket.id);
});

//get the room name from the location
Client.room = window.location.hash.substring(1);

//variable for team name
Client.team = null;

//fucntion to set the team
Client.setTeam = function(team){
    console.log(Client.playerName);
    Client.team = team;
    console.log("my team name is " + Client.team);
};

//function get players
Client.getPlayers = function (){
    Client.socket.emit('getPlayers', Client.room);
};

//function to ask for a new player
Client.askNewPlayer = function(name) {
    Client.socket.emit('newPlayer', Client.playerName, Client.room);
};

//invoke functions
Client.askNewPlayer();
Client.getPlayers();



