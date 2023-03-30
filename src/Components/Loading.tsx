import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      <div className="absolute animate-spin ease-in-out rounded-full h-[6rem] w-[6rem] border-t-2 border-b-2 border-t-eprimary-color border-b-transparent"></div>
    </div>
  );
};

export default Loading;
