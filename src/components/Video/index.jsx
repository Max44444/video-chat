import './styles.scss';

export const Video = ({isMuted, videoRef}) => {
    return (
        <div className='video-container'>
            <video
                className='video'
                autoPlay
                playsInline
                muted={isMuted}
                ref={videoRef}
            />
        </div>
    )
};
