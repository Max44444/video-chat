const path = require('path')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const { version, validate } = require('uuid')
const {
    SHARE_ROOMS,
    JOIN,
    ADD_PEER,
    LEAVE,
    REMOVE_PEER,
    RELAY_SDP,
    RELAY_ICE,
    SESSION_DESCRIPTION,
    ICE_CANDIDATE
} = require('./src/socket/socket-actions')

const PORT = process.env.PORT ?? 80

function getClientRooms() {
    const {rooms} = io.sockets.adapter

    return Array.from(rooms.keys()).filter(roomID => validate(roomID) && version(roomID) === 4)
}

function shareRoomsInfo() {
    io.emit(SHARE_ROOMS, {
        rooms: getClientRooms()
    })
}

io.on('connection', socket => {
    shareRoomsInfo()

    socket.on(JOIN, config => {
        const {room: roomID} = config
        const {rooms: joinedRooms} = socket

        if (Array.from(joinedRooms).includes(roomID)) {
            return console.warn(`Already joined to ${roomID}`)
        }

        const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || [])

        clients.forEach(clientID => {
            io.to(clientID).emit(ADD_PEER, {
                peerID: socket.id,
                createOffer: false
            })

            socket.emit(ADD_PEER, {
                peerID: clientID,
                createOffer: true,
            })
        })

        socket.join(roomID)
        shareRoomsInfo()
    })

    function leaveRoom() {
        const {rooms} = socket

        Array.from(rooms)
            .filter(roomID => validate(roomID) && version(roomID) === 4)
            .forEach(roomID => {
                const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || [])

                clients
                    .forEach(clientID => {
                        io.to(clientID).emit(REMOVE_PEER, {
                            peerID: socket.id,
                        })

                        socket.emit(REMOVE_PEER, {
                            peerID: clientID,
                        })
                    })

                socket.leave(roomID)
            })

        shareRoomsInfo()
    }

    socket.on(LEAVE, leaveRoom)
    socket.on('disconnecting', leaveRoom)

    socket.on(RELAY_SDP, ({peerID, sessionDescription}) => {
        io.to(peerID).emit(SESSION_DESCRIPTION, {
            peerID: socket.id,
            sessionDescription,
        })
    })

    socket.on(RELAY_ICE, ({peerID, iceCandidate}) => {
        io.to(peerID).emit(ICE_CANDIDATE, {
            peerID: socket.id,
            iceCandidate,
        })
    })

    socket.on('delete-user', ({ userID }) => {
        const {rooms} = socket

        Array.from(rooms)
            .filter(roomID => validate(roomID) && version(roomID) === 4)
            .forEach(roomID => {
                const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || [])

                clients
                    .forEach(clientID => {
                        io.to(clientID).emit(REMOVE_PEER, {
                            peerID: userID,
                        })

                        io.to(userID).emit(REMOVE_PEER, {
                            peerID: clientID,
                        })
                    })

                io.sockets.connected[userID].leave(roomID)
            })

        shareRoomsInfo()
    })

})

const publicPath = path.join(__dirname, 'build')

app.use(express.static(publicPath))

app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'))
})

server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})