import React from 'react';
import './style.css';
import { MdAccessTime, MdOutlineCheck } from 'react-icons/md';
import CheckedStatus from '../CheckedStatus';

type Props = React.PropsWithChildren<{
  isLeft:boolean;
  time:string;
  msgid:string;
  status:string;
}>;

const Balloon : React.FC<Props> = (props) => {
  

  
  const localTime: React.ReactNode = <div className='text-sm text-gray-600 flex flex-col justify-center'>{props.time}</div>

  if (typeof props.children === "string" && props.children && props.children.includes('\n')) {
    const lines = (props.children! as string).split("\n");
    return (<>
      {!props.isLeft && localTime}
      <div className={`break-all ${props.isLeft ? "bln blft": "bln brgt"}`}>{lines.map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
          
        ))}
        {!props.isLeft && <CheckedStatus status={props.status} />}
      </div> 
      {props.isLeft && localTime}
    </>);
  }

  return (<>
    {!props.isLeft && localTime}
    <div className={`break-all ${props.isLeft ? "bln blft": "bln brgt"}`}>
      {props.children}
      {!props.isLeft && <CheckedStatus status={props.status}/>}
    </div> 
    {props.isLeft && localTime}
  </>
  );
};

export default Balloon;
