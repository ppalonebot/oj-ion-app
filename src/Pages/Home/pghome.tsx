import * as React from 'react';
import '../../index.css'
import { Link } from 'react-router-dom';
import { User } from '../../Entity/User/User_model';
import ConfirmRegistration from './ConfirmRegistration';
import Main from './Main';

type Props = {
  page?:string;
}

const Home: React.FC<Props> = (props) => {
  const [userself, setUserSelf] = React.useState<User|null>(User.load())

  const RegistrationConfirmed = (u:User) =>{
    u.save()
    setUserSelf(u)
  }

  return (
    <>
    {
      userself? userself.isregistered? <Main user={userself} page={props.page??""}/> : 

      <ConfirmRegistration user={userself} onValid={RegistrationConfirmed}/> : 

      <div className='p-4 min-w-[100vw] min-h-[100vh] flex flex-col justify-start items-center'>
        <h1 className='text-center text-4xl'>PESATU</h1>
        <p className='font-signature text-center text-xl'>Bringing people and technology together</p>
        <div className='p-8 w-full flex justify-center items-center gap-4 max-w-lg'>
          <Link to={process.env.PUBLIC_URL+"/login"} className="text-center w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Login
          </Link >
          <Link to={process.env.PUBLIC_URL+"/register"} className="text-center w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Register
          </Link>
        </div>
      </div>
    }
    </>
  );
};

export default Home;
