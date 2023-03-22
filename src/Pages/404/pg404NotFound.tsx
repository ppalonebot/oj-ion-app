import React from 'react';
import { Link } from 'react-router-dom';
import HttpStatus from '../../Components/HttpStatus';

const PageNotFound: React.FC = () => {
  return (
    <HttpStatus headerTitle='404 Page Not Found'>
      <p className="text-xl font-signature mb-4 max-w-xl text-center">We're sorry, but the page you were looking for could not be found.</p>
      <Link to={process.env.PUBLIC_URL+"/"} className="mt-4 text-center w-60 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Go to Homepage
      </Link>
    </HttpStatus>
  );
}

export default PageNotFound;
