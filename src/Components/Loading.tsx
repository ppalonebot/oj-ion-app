import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      <div className="absolute animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-eprimary-color"></div>
      <div className="absolute animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-eprimary-color"></div>
    </div>
  );
};

export default Loading;
