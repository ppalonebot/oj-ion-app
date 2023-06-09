import React , { FC } from 'react';
import Home from './Pages/Home/pgHome';
import './index.css';
import { Routes,Route, Navigate, useNavigate  } from 'react-router-dom'
import Login from './Pages/Login/pgLogin';
import { QueryClient, QueryClientProvider } from 'react-query';
import ResetPassword from './Pages/ResetPassword/pgResetPassword';
import UserRegister from './Pages/Register/pgRegister';
import PageNotFound from './Pages/404/pg404NotFound';
import PageServiceUnavailable from './Pages/503/pg503ServiceUnavailable';

const App: FC = () => {
  const queryClient = new QueryClient();
  const hash = window.location.hash
  const navigate = useNavigate()
  
  React.useEffect(() => {
    if (hash.length > 1){
      navigate(hash.substring(1))
    }
  }, []);
  
  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route index path={process.env.PUBLIC_URL+'/'} element={<Home/>}/>
          <Route path={process.env.PUBLIC_URL+'/message'} element={<Home page={"message"}/>}/>
          <Route path={process.env.PUBLIC_URL+'/profile'} element={<Home page={"profile"}/>}/>
          <Route path={process.env.PUBLIC_URL+'/profileedit'} element={<Home page={"profileedit"}/>}/>
          <Route path={process.env.PUBLIC_URL+'/avatardetail'} element={<Home page={"avatardetail"}/>}/>
          <Route path={process.env.PUBLIC_URL+'/imagedetail'} element={<Home page={"imagedetail"}/>}/>
          <Route path={process.env.PUBLIC_URL+'/searchuser'} element={<Home page={"searchuser"}/>}/>
          <Route path={process.env.PUBLIC_URL+'/friendrequest'} element={<Home page={"friendrequest"}/>}/>
          <Route path={process.env.PUBLIC_URL+'/echo'} element={<Home page={"echo"}/>}/>
          <Route path={process.env.PUBLIC_URL+'/login'} element={<Login usr={''} pwd={''}/>}/>
          <Route path={process.env.PUBLIC_URL+'/google/callback'} element={<Login usr={''} pwd={''}/>}/>
          <Route path={process.env.PUBLIC_URL+'/register'} element={<UserRegister />}/>
          <Route path={process.env.PUBLIC_URL+'/resetpwd'} element={<ResetPassword/>}/>
          <Route path={process.env.PUBLIC_URL+'/503'} element={<PageServiceUnavailable/>}/>
          <Route path={process.env.PUBLIC_URL+'/404'} element={<PageNotFound/>}/>
          <Route path={process.env.PUBLIC_URL+'/app'} element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </QueryClientProvider>
    </div>
  );
}

export default App;
