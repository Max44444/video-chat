import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ApplicationContextProvider } from './context/ApplicationContextProvider';
import"./App.scss"
import { Main } from './components/Main';
import { Room } from './components/Room/Room';
import { NotFound } from './components/NotFound';
import { Layout } from './components/Layout';

const App = () => (
    <ApplicationContextProvider>
        <Layout>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<Main/>}/>
                    <Route path='/room/:id' element={<Room/>}/>
                    <Route path='/*' element={<NotFound/>} />
                </Routes>
            </BrowserRouter>
        </Layout>
    </ApplicationContextProvider>
)

export default App;
