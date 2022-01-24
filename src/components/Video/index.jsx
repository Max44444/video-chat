import './styles.scss';

export const Video = ({isMuted, videoRef, onVideoClick, isMyVideo }) => {
    const classes = ['video-control', isMyVideo ? 'd-none' : ''].join('')
    return (
        <div className='video-container'>
            <div className={classes} onClick={onVideoClick}>
                <div>
                    Delete participant
                </div>
            </div>
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
