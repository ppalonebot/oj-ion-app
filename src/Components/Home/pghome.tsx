import * as React from 'react';
import '../../index.css'
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className='h-screen w-screen'>
      <div className='p-4 w-full h-full flex flex-col justify-start items-center'>
        <h1 className='text-center text-4xl'>PESATU</h1>
        <p className='font-signature text-center'>Bringing people and technology together</p>

        <div className='p-8 w-full flex justify-center items-center gap-4 max-w-lg'>
          <Link to={process.env.PUBLIC_URL+"/login"} className="text-center w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Login
          </Link >
          <Link to={process.env.PUBLIC_URL+"/register"} className="text-center w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
