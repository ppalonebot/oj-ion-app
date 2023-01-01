import { FC } from 'react';
import Home from './Pages/Home/pghome';
import './index.css';
import { Routes,Route, Navigate} from 'react-router-dom'
import Login from './Pages/Login/pglogin';
import UserRegister from './Pages/Register/pgregister';
import { QueryClient, QueryClientProvider } from 'react-query';

const App: FC = () => {
  const queryClient = new QueryClient();
  
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route index path={process.env.PUBLIC_URL+'/'} element={<Home/>}/>
          <Route path={process.env.PUBLIC_URL+'/login'} element={<Login usr={''} pwd={''}/>}/>
          <Route path={process.env.PUBLIC_URL+'/register'} element={<UserRegister />}/>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </QueryClientProvider>
    </div>
  );
}

export default App;
