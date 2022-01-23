import { Header } from '../Header';
import './styles.scss'

export const Layout = ({ children }) => <div className='layout'>
    <Header/>
    <main>
        {children}
    </main>
</div>