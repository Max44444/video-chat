import { Video } from '../Video';
import { useNavigate, useParams } from 'react-router';
import { LOCAL_VIDEO, useWebRTC } from '../../hooks/useWebRTC';
import { Controls } from '../Controls';
import './styles.scss'
import { useContext } from 'react';
import { ApplicationContext } from '../../context/ApplicationContextProvider';

export const Room = () => {
    const { id: roomID } = useParams();
    const { clients, provideMediaRef, toggleAudio, toggleVideo, leaveTheRoom, deleteUserFromRoom } = useWebRTC(roomID)
    const { createdRoomID, setCreatedRoomID } = useContext(ApplicationContext)
    const navigate = useNavigate()

    const isOwner = roomID === createdRoomID

    const onUserLiveTheRoom = () => {
        leaveTheRoom()
        if (isOwner) {
            setCreatedRoomID(null)
        }
        navigate('/')

    }

    const handleOnVideoClick = userID => {
        deleteUserFromRoom({userID, roomID})
    }

    return (
        <div className='room-page'>
            <div className='videos'>
                { clients.map((clientID, index) => (
                    <div key={ clientID } id={ index }>
                        <Video
                            clientID={ clientID }
                            videoRef={ instance => {
                                provideMediaRef(clientID, instance)
                            } }
                            isMuted={ clientID === LOCAL_VIDEO }
                            isMyVideo={ clientID === LOCAL_VIDEO || !isOwner }
                            onVideoClick={() => handleOnVideoClick(clientID)}
                        />
                    </div>
                )) }
            </div>
            <Controls toggleAudio={ toggleAudio }
                      toggleVideo={ toggleVideo }
                      onUserLiveTheRoom={ onUserLiveTheRoom }
                      isOwner={isOwner}
                      roomID={roomID}/>
        </div>
    )
}