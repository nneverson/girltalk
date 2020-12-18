const socket = io();
const peer = new Peer();
const message = document.getElementById('message');
const idHtmlElement = document.getElementById('peer-id');
const local = document.getElementById('local-video');
const remote = document.getElementById('remote-video');
const getUserMedia =
	navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia;

let callerId = null;
let receiverId = null;
let isCaller = false;

peer.on('open', function (id) {
	callerId = id;
	socket.emit('hello world', id);
	// idHtmlElement.innerHTML = id;
});
//if the caller is in a room unpaired, display a message saying 'waiting for second user', set isCaller to true

socket.on('unpaired caller', function (data) {
	message.innerHTML = 'waiting for second caller';
	isCaller = true;
});

socket.on('receiver joined', function (data) {
	console.log(data);
	callerId = data.caller;
	receiverId = data.receiver;
	message.innerHTML = 'connection established';
	if (isCaller) {
		getUserMedia(
			{
				video: true,
				audio: true,
			},
			function (localStream) {
				local.srcObject = localStream;
				local.play();
				const call = peer.call(receiverId, localStream);
				call.on('stream', function (remoteStream) {
					remote.srcObject = remoteStream;
					remote.play();
				});
			},
			function (error) {
                console.log(error);
			}
            );
        } else {
            peer.on('call', function (call) {
                getUserMedia(
                    {
                        video: true,
                        audio: true,
                    },
                    function (localStream) {
                    console.log(call)
					local.srcObject = localStream;
					local.play();
					call.answer(localStream);
					call.on('stream', function (remoteStream) {
						remote.srcObject = remoteStream;
						remote.play();
					});
				},
				function (error) {
					console.log(error);
				}
			);
		});
	}
});
