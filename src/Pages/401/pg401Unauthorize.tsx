import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className='min-h-screen'>
      <div className='p-4 w-full h-full flex flex-col justify-start items-center'>
        <h1 className="text-4xl mb-4">401 Unauthorized</h1>
        <p className="text-xl font-signature mb-4">You need login to see this page.</p>
        <Link to={process.env.PUBLIC_URL+"/login"} className="mt-16 text-center w-60 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Login
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;
