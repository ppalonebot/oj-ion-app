import React from 'react';

type Props = React.PropsWithChildren<{
  headerTitle:string;
}>

const HttpStatus: React.FC<Props> = (props) => {
  return (
    <div className='h-screen w-screen flex'>
      <div className='p-4 w-full h-full flex flex-col justify-center items-center'>
        <h1 className="text-4xl mb-4">{props.headerTitle}</h1>
        {props.children}
      </div>
    </div>
  );
}

export default HttpStatus;