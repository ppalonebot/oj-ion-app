import React from "react";
import { MdAccessTime, MdOutlineCheck } from "react-icons/md";
import { VscCheckAll, VscCheck } from "react-icons/vsc";

type Props = {
  status:string;
  className?:string;
}

const CheckedStatus: React.FC<Props> = (props) => {
  const status: React.ReactNode = props.status === "sent" ?
    <div className='text-red-500'><MdAccessTime size={14}/></div> :
    props.status === "acc" ?
    <div className='text-gray-600'><VscCheck size={14}/></div> :
    props.status === "delv" ?<>
    <div className='text-gray-600'><VscCheckAll size={14}/></div>
    </> :
    props.status === "read" ?<>
    <div className='text-eprimary-color'><VscCheckAll size={14}/></div>
    </> : <></>
  return(<div className={props.className??"absolute bottom-0 right-[-1rem]"}>{status}</div>)
}

export default CheckedStatus