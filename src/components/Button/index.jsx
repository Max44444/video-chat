import './styles.scss';

export const Button = ({name, onClick, children, isOn = true}) => {
    const classes = ['control-button', isOn ? 'control-on' : 'control-off']
    return (
        <button className={classes.join(' ')} onClick={onClick}>
            {children}
            <span className="name">{name}</span>
        </button>
    );
};
