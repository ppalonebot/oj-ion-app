import React from 'react';
import { Link } from 'react-router-dom';
import HttpStatus from '../../Components/HttpStatus';

const Unauthorized: React.FC = () => {
  return (
    <HttpStatus headerTitle='401 Unauthorized'>
      <p className="text-xl font-signature mb-4 max-w-xl text-center">You need login to see this page.</p>
      <Link to={process.env.PUBLIC_URL+"/login"} className="mt-4 text-center w-60 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Login
      </Link>
    </HttpStatus>
  );
}

export default Unauthorized;
