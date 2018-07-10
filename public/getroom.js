var room;

function submitRoom(roomName) {
    room = document.getElementById("rmFld").value;
    window.location.href = 'game.html' + "#" + room;
}