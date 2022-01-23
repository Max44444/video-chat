import './styles.scss'

export const RoomItem = ({ roomID, onRoomSelected, index }) => {
    return <div className='room-item'>
        <div className='room-info'>
            <h3 className="index">Room #{ index + 1 }</h3>
            <span className="room-id">ID: { roomID }</span>
        </div>
        <button className='select-button' onClick={ onRoomSelected }>
            Join room
        </button>
    </div>;
}