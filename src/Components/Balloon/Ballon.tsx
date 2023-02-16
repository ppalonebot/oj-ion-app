import React from 'react';
import './style.css';
import { MdAccessTime, MdOutlineCheck } from 'react-icons/md';

type Props = React.PropsWithChildren<{
  isLeft:boolean;
  time:string;
  msgid:string;
  status:string;
}>;

const Balloon : React.FC<Props> = (props) => {
  const status: React.ReactNode = props.status === "sent" ?
    <div className='absolute bottom-0 right-[-1rem]'><MdAccessTime size={14}/></div> :
    props.status === "acc" ?
    <div className='absolute bottom-0 right-[-1rem]'><MdOutlineCheck size={14}/></div> :
    props.status === "delv" ?<>
    <div className='absolute bottom-0 right-[-1rem]'><MdOutlineCheck size={14}/></div>
    <div className='absolute bottom-0 right-[-1.3rem]'><MdOutlineCheck size={14}/></div>
    </> :
    props.status === "read" ?<>
    <div className='text-blue-500 absolute bottom-0 right-[-1rem]'><MdOutlineCheck size={14}/></div>
    <div className='text-blue-700 absolute bottom-0 right-[-1.3rem]'><MdOutlineCheck size={14}/></div>
    </> : <></>
  
  if (typeof props.children === "string" && props.children && props.children.includes('\n')) {
    const lines = (props.children! as string).split("\n");
    return (<>
      <div className={props.isLeft ? "bln blft": "bln brgt"}>{lines.map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
          
        ))}
        {status}
        </div> 
    </>);
  }

  return (
    <div className={props.isLeft ? "bln blft": "bln brgt"}>
      {props.children}
      {status}
    </div> 
  );
};

export default Balloon;
