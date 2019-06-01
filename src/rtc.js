let peers = {}
let loosePeer;

const rtc_config = {
    iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
    }]
};

import socketIO from 'socket.io-client'
const socket = socketIO('wss://hitcher.land:3001');

const join = callback => {
    socket.on('join', (message) => {
        callback(message)
    })
}

const signaling = callback => {
    // Listen for 'signaling' messages
    socket.on('signaling', (message) => {
        callback(message)
    })
}

const send = (channel, message) => {
    // Send message to server
    socket.emit(channel, message)
}

const ice_candidate = callback => {
    socket.on('ice-candidate', (message) => {
        callback(message)
    })
}

var onMessageCallback = () => {};
function setOnMessageCallback(callback) {
    onMessageCallback = callback
}

function createConnection(id) {
    var peer;
    if(id === undefined) {
        loosePeer = peer = {}
    } else {
        peers[id] = peer = {}
    }

    peer.id = id
    peer.connection = new RTCPeerConnection(rtc_config);
    peer.out_channel = peer.connection.createDataChannel('drawpg');
    peer.in_channel = undefined;

    peer.connection.onicecandidate = (e) => {
        if(peer.id === undefined)
            return;

        send("ice-candidate", {
            target: peer.id,
            candidate: e.candidate
        });
    }

    peer.connection.onnegotiationneeded = () => {
        if(peer.connection.signalingState == "have-local-offer")
            return;
        else if(peer.connection.signalingState == "have-remote-offer")
            return;

        peer.connection.createOffer().then(offer => {
            return peer.connection.setLocalDescription(offer);
        }).then(() => {
            var msg = {
                type: "offer",
                target: peer.id || "all",
                sdp: peer.connection.localDescription
            }
            send("signaling", msg);
        });
    }

    function onChannelStateChange() {
    }

    peer.out_channel.onopen = onChannelStateChange;
    peer.out_channel.onclose = onChannelStateChange;
    peer.connection.ondatachannel = (event) => {

        function onReceiveMessageCallback(event) {
            onMessageCallback(JSON.parse(event.data));
        }

        function onReceiveChannelStateChange() {
        }

        peer.in_channel = event.channel;
        peer.in_channel.onmessage = onReceiveMessageCallback;
        peer.in_channel.onopen = onReceiveChannelStateChange;
        peer.in_channel.onclose = onReceiveChannelStateChange;

    };
    return peer;
}

function sendData(data) {
    var d = JSON.stringify(data);
    Object.values(peers).forEach(peer => peer.out_channel.send(d));
}

function closeDataChannels() {
    Object.values(peers).forEach(peer => {
        peer.in_channel.close();
        peer.out_channel.close();
        peer.connection.close();
        peer.connection = null;
    });
}

join(message => {
    for(var id of message.ids) {
        createConnection(id);
    }
});

// receive description from remote source
signaling(message => {
    var peer;

    var remoteId = message.responder;
    if(peers[remoteId] === undefined && loosePeer === undefined) {
        peers[remoteId] = peer = createConnection(remoteId);
    } else if (loosePeer !== undefined) {
        peer = loosePeer;
        loosePeer = undefined;
        peers[remoteId] = peer;
    } else {
        peer = peers[remoteId];
    }

    var connection = peer.connection;
    var desc = new RTCSessionDescription(message.sdp);

    if(connection.localDescription === null) {
        connection.setRemoteDescription(desc).then(() => {
            return connection.createAnswer()
        }).then(answer => {
            return connection.setLocalDescription(answer);
        }).then(() => {
            var msg = {
                type: "answer",
                target: message.responder,
                sdp: connection.localDescription
            };
            send("signaling", msg);
        });
    } else {
        connection.setRemoteDescription(desc);
    }
});

ice_candidate(message => {
    var candidate = new RTCIceCandidate(message.candidate);
    peers[message.responder].connection.addIceCandidate(candidate);
});

export { sendData, setOnMessageCallback }
