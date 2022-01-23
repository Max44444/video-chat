import { Link } from 'react-router-dom';
import './styles.scss'

export const NotFound = () => (
    <div className='not-found'>
        <h2 className='title'>404 Not found</h2>
        <Link to='/'>
            <span className='back-link'>Back to main page</span>
        </Link>
    </div>
)