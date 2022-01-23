import { Video } from '../Video';
import { useNavigate, useParams } from 'react-router';
import { LOCAL_VIDEO, useWebRTC } from '../../hooks/useWebRTC';
import { Controls } from '../Controls';
import './styles.scss'

export const Room = () => {
    const { id: roomID } = useParams();
    const { clients, provideMediaRef, toggleAudio, toggleVideo, leaveTheRoom } = useWebRTC(roomID)
    const navigate = useNavigate()

    const onUserLiveTheRoom = () => {
        leaveTheRoom()
        navigate('/')
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
                        />
                    </div>
                )) }
            </div>
            <Controls toggleAudio={ toggleAudio }
                      toggleVideo={ toggleVideo }
                      onUserLiveTheRoom={ onUserLiveTheRoom }/>
        </div>
    )
}