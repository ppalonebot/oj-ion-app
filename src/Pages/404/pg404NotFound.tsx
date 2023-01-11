import React from 'react';
import { Link } from 'react-router-dom';

const PageNotFound: React.FC = () => {
  return (
    <div className='min-h-screen'>
      <div className='p-4 w-full h-full flex flex-col justify-start items-center'>
        <h1 className="text-4xl mb-4">404 Page Not Found</h1>
        <p className="text-xl font-signature mb-4">We're sorry, but the page you were looking for could not be found.</p>
        <Link to={process.env.PUBLIC_URL+"/"} className="mt-16 text-center w-60 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}

export default PageNotFound;
