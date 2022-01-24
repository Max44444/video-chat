import { useContext, useEffect, useRef, useState } from 'react'
import { ApplicationContext } from '../../context/ApplicationContextProvider'
import { useNavigate } from 'react-router'
import { v4 } from 'uuid'
import './styles.scss'
import * as PropTypes from 'prop-types';
import { RoomItem } from '../RoomItem';

RoomItem.propTypes = {
    roomID: PropTypes.any,
    onClick: PropTypes.func
};
export const Main = () => {
    const navigate = useNavigate()
    const { socket, setCreatedRoomID } = useContext(ApplicationContext)
    const [rooms, updateRooms] = useState([])
    const rootNode = useRef()

    useEffect(() => {
        socket.on('share-rooms', ({rooms} = {rooms: []}) => {
            if (rootNode.current) {
                updateRooms(rooms)
            }
        })
    })

    const handleCreateRoom = () => {
        const roomID = v4();
        setCreatedRoomID(roomID)
        navigate(`/room/${roomID}`)
    }

    return (
        <div className='main-page' ref={rootNode}>
            <h1 className='rooms-header'>Available Rooms</h1>
            <div className='rooms'>
                {rooms.length === 0 && <div>There are no rooms</div>}
                {rooms.map((roomID, idx) => (
                    <RoomItem key={ roomID }
                              roomID={ roomID }
                              index={idx}
                              onRoomSelected={ () => navigate(`/room/${ roomID }`) }/>
                ))}
            </div>
            <button className='create-room-btn' onClick={handleCreateRoom}>
                Create New Room
            </button>
        </div>
    )
}