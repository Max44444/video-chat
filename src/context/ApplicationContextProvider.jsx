import { createContext, useState } from 'react';
import { io } from 'socket.io-client';

export const ApplicationContext = createContext(null)

export const ApplicationContextProvider = ({children}) => {
    const socket = io(`/`, {
        'force new connection': true,
        reconnectionAttempts: Infinity,
        timeout: 10000,
        transports: ['websocket']
    })

    const [showVideo, setShowVideo] = useState(true)
    const [isUnMuted, setIsUnMuted] = useState(true)
    const [createdRoomID, setCreatedRoomID] = useState(null)

    const context = {
        socket,
        showVideo,
        setShowVideo,
        isUnMuted,
        setIsUnMuted,
        createdRoomID,
        setCreatedRoomID
    }

    return (
        <ApplicationContext.Provider value={context}>
            {children}
        </ApplicationContext.Provider>
    )
}