console.log("javascript dashboard test")
id="testid"

function fetchuserdata(){
    socket.emit("fetchuserdata", id, currentkey)
}