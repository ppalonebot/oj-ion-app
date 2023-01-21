import React from 'react';
import './style.css'
interface Props {
  loading: boolean;
}

const LoadingBar: React.FC<Props> = ({ loading }) => {
  return (
    <>
    {loading && (
      <div className="loader-line"/>
    )}
    </>
  );
};

export default LoadingBar;
