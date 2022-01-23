import { useContext, useEffect } from 'react';
import './styles.scss';
import { Button } from '../Button';
import { ImExit } from 'react-icons/im';
import { ApplicationContext } from '../../context/ApplicationContextProvider'
import { BsCameraVideoFill, BsCameraVideoOffFill, BsFillMicFill, BsFillMicMuteFill } from 'react-icons/bs';

export const Controls = ({ toggleVideo, toggleAudio, onUserLiveTheRoom }) => {
    const { showVideo, setShowVideo, isUnMuted, setIsUnMuted } = useContext(ApplicationContext);

    useEffect(() => toggleVideo(showVideo), [showVideo, toggleVideo]);
    useEffect(() => toggleAudio(isUnMuted), [isUnMuted, toggleAudio]);

    const videoButtonClickHandler = () => setShowVideo(prev => !prev);
    const audioButtonClickHandler = () => setIsUnMuted(prev => !prev);

    return (
        <div className="control-panel">
            <div className="controls">
                <Button name={ showVideo ? 'Stop Video' : 'Start Video' }
                        onClick={ videoButtonClickHandler }
                        isOn={ showVideo }>
                    { showVideo ? <BsCameraVideoFill className="icon"/> : <BsCameraVideoOffFill className="icon"/> }
                </Button>
                <Button name={ isUnMuted ? 'Mute' : 'Unmute' }
                        onClick={ audioButtonClickHandler }
                        isOn={ isUnMuted }>
                    { isUnMuted ? <BsFillMicFill className="icon"/> : <BsFillMicMuteFill className="icon"/> }
                </Button>
                <Button name="Leave"
                        onClick={onUserLiveTheRoom}>
                    <ImExit className="icon"/>
                </Button>
            </div>
        </div>
    );
};
