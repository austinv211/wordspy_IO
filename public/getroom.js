var room;

function submitRoom(roomName) {
    room = document.getElementById("rmFld").value;
    window.localStorage.setItem("name", document.getElementById("nameField").value);
    window.location.href = 'game.html' + "#" + room;
}