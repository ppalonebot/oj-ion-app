import React from 'react';
import { Link } from 'react-router-dom';
import HttpStatus from '../../Components/HttpStatus';

const PageServiceUnavailable: React.FC = () => {
  return (
    <HttpStatus headerTitle='503 Service Unavailable'>
      <p className="text-xl font-signature mb-4 max-w-xl text-center">We're sorry, the server is currently unable to handle your request due to maintenance, overloading, or other reasons.</p>
        <Link to={process.env.PUBLIC_URL+"/"} className="mt-4 text-center w-60 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Reload
        </Link>
    </HttpStatus>
  );
}

export default PageServiceUnavailable;
