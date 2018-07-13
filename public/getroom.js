//declare variable room
var room;

//function to submit the room name
function submitRoom(roomName) {
    //get the room field
    room = document.getElementById("rmFld").value;
    //save the value of the name field to local storage
    window.localStorage.setItem("name", document.getElementById("nameField").value);
    //append the url with the room name
    window.location.href = 'game.html' + "#" + room;
}