import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useStateWithCallback } from './useStateWithCallback'
import { ApplicationContext } from '../context/ApplicationContextProvider'
import {
    JOIN,
    LEAVE,
    ADD_PEER,
    RELAY_ICE,
    RELAY_SDP,
    SESSION_DESCRIPTION,
    ICE_CANDIDATE,
    REMOVE_PEER,
    DISCONNECTED,
    DELETE_USER
} from '../socket/socket-actions'
import freeice from 'freeice'
import { useNavigate } from 'react-router';

export const LOCAL_VIDEO = 'LOCAL_VIDEO'

export const useWebRTC = (roomID) => {
    const { socket } = useContext(ApplicationContext)
    const [clients, updateClients] = useStateWithCallback([])
    const navigate = useNavigate()

    const addNewClient = useCallback((newClient, cb) => {
        updateClients(list => {
            if (!list.includes(newClient)) {
                return [...list, newClient]
            }

            return list
        }, cb)
    }, [updateClients])

    const peerConnections = useRef({})
    const localMediaStream = useRef(null)
    const peerMediaElements = useRef({
        [LOCAL_VIDEO]: null
    })

    const leaveTheRoom = () => {
        localMediaStream.current.getTracks().forEach(track => track.stop)
        socket.emit(LEAVE)
    }

    useEffect(() => {
        const handleNewPeer = async ({ peerID, createOffer }) => {
            if (peerID in peerConnections.current) {
                return console.warn(`Already connected to peer ${ peerID }`)
            }

            peerConnections.current[peerID] = new RTCPeerConnection({
                iceServers: freeice(),
            })

            peerConnections.current[peerID].onicecandidate = event => {
                if (event.candidate) {
                    socket.emit(RELAY_ICE, {
                        peerID,
                        iceCandidate: event.candidate,
                    })
                }
            }

            let tracksNumber = 0
            peerConnections.current[peerID].ontrack = ({ streams: [remoteStream] }) => {
                tracksNumber++

                if (tracksNumber === 2) {
                    tracksNumber = 0
                    addNewClient(peerID, () => {
                        if (peerMediaElements.current[peerID]) {
                            peerMediaElements.current[peerID].srcObject = remoteStream
                        } else {
                            let settled = false
                            const interval = setInterval(() => {
                                if (peerMediaElements.current[peerID]) {
                                    peerMediaElements.current[peerID].srcObject = remoteStream
                                    settled = true
                                }

                                if (settled) {
                                    clearInterval(interval)
                                }
                            }, 1000)
                        }
                    })
                }
            }

            localMediaStream.current.getTracks().forEach(track => {
                peerConnections.current[peerID].addTrack(track, localMediaStream.current)
            })

            if (createOffer) {
                const offer = await peerConnections.current[peerID].createOffer()

                await peerConnections.current[peerID].setLocalDescription(offer)

                socket.emit(RELAY_SDP, {
                    peerID,
                    sessionDescription: offer,
                })
            }
        }

        socket.on(ADD_PEER, handleNewPeer)

        return () => socket.off(ADD_PEER)
    }, [])

    useEffect(() => {
        const setRemoteMedia = async ({ peerID, sessionDescription: remoteDescription }) => {
            await peerConnections.current[peerID]?.setRemoteDescription(
                new RTCSessionDescription(remoteDescription)
            )

            if (remoteDescription.type === 'offer') {
                const answer = await peerConnections.current[peerID].createAnswer()

                await peerConnections.current[peerID].setLocalDescription(answer)

                socket.emit(RELAY_SDP, {
                    peerID,
                    sessionDescription: answer,
                })
            }
        }

        socket.on(SESSION_DESCRIPTION, setRemoteMedia)

        return () => socket.off(SESSION_DESCRIPTION)
    }, [])

    useEffect(() => {
        socket.on(ICE_CANDIDATE, ({ peerID, iceCandidate }) => {
            peerConnections.current[peerID].addIceCandidate(
                new RTCIceCandidate(iceCandidate)
            )
        })

        return () => socket.off(ICE_CANDIDATE)
    }, [])

    useEffect(() => {
        const handleRemovePeer = ({ peerID }) => {
            if (peerConnections.current[peerID]) {
                peerConnections.current[peerID].close()
            }

            delete peerConnections.current[peerID]
            delete peerMediaElements.current[peerID]

            updateClients(list => list.filter(c => c !== peerID))
        }

        socket.on(REMOVE_PEER, handleRemovePeer)

        return () => socket.off(REMOVE_PEER)
    }, [])

    useEffect(() => {
        const startCapture = async () => {
            localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    width: 1280,
                    height: 720,
                }
            })

            addNewClient(LOCAL_VIDEO, () => {
                const localVideoElement = peerMediaElements.current[LOCAL_VIDEO]

                if (localVideoElement) {
                    localVideoElement.volume = 0
                    localVideoElement.srcObject = localMediaStream.current
                }
            })
        }

        startCapture()
            .then(() => socket.emit(JOIN, { room: roomID }))
            .catch(e => console.error('Error getting userMedia:', e))

        return leaveTheRoom
    }, [roomID])

    useEffect(() => {
        const handleDisconnected = () => {
            localMediaStream.current.getTracks().forEach(track => track.stop())
            navigate("/")
        }

        socket.on(DISCONNECTED, handleDisconnected)

        return () => socket.off(DISCONNECTED)
    }, [])

    const provideMediaRef = useCallback((id, node) => {
        peerMediaElements.current[id] = node
    }, [])

    const toggleVideo = isOn => {
        if (localMediaStream.current) {
            localMediaStream.current.getTracks()[1].enabled = isOn
        }
    }

    const toggleAudio = isOn => {
        if (localMediaStream.current) {
            localMediaStream.current.getTracks()[0].enabled = isOn
        }
    }

    const deleteUserFromRoom = ({ userID, roomID }) => {
        socket.emit(DELETE_USER, { userID, roomID })
    }

    return {
        clients,
        provideMediaRef,
        toggleAudio,
        toggleVideo,
        leaveTheRoom,
        deleteUserFromRoom
    }
}