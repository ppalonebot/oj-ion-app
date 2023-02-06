import React from "react";
import { useMutation } from "react-query";
import { API_URL } from "../global";
import { JsonRPC2 } from "../lib/MyJsonRPC2";
import { MdMail } from "react-icons/md";
import { STATUS } from "../Entity/Enum";
import { Contact } from "../Entity/User/Contact_model";
import { Link } from "react-router-dom";

type Props = {
  uid:string;
  target:string;
  contact:Contact|null;
}

const CttStatus: React.FC<Props> = (props) => {
  const [contact,setContact] = React.useState<Contact|null>(props.contact)
  const mutationResult  = useMutation(
    (rpc : JsonRPC2) => fetch(API_URL+'/contacts/rpc', {
      method: 'POST',
      body: JSON.stringify(rpc),
      credentials: 'include', //must included
      headers: { 
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()),
    {
      onSuccess: (data,v ,ctx) => {
        if (data.result !== null){
          console.log(data.result)
          setContact(data.result as Contact)
        }
        else{
          if (data.error){
           console.log(data.error)
          }
          else{
            console.log("no data")
          }
        }
      },
      onError: (error, v, ctx) => {
        console.log("error")
      }
    }
  );
  const addFirend = mutationResult.mutate;
  const status = mutationResult.status;

  const addBtnClicked = () =>{
    const rpc : JsonRPC2 = new JsonRPC2("AddContact",{uid:props.uid,to_usr:props.target})
    addFirend(rpc)
  }

  if (!contact) {
    return(
      <button 
        className="bg-blue-500 text-white rounded hover:bg-blue-700 h-8 w-full my-auto"
        disabled={status === 'loading'}
        onClick={addBtnClicked}
      >
        {status === 'loading'? "Sending...":"Add"}
      </button>
    )
  } else {
    switch (contact.status) {
      case STATUS.Pending:
        return (
          <button 
            className="bg-red-500 text-white rounded hover:bg-red-700 h-8 w-full my-auto"
            disabled={status === 'loading'}
            onClick={addBtnClicked}
          >
            {status === 'loading'? "Sending...":"Accept"}
          </button>)
      case STATUS.Waiting:
        return (
          <button 
            className="bg-slate-700 text-white rounded h-8 w-full my-auto"
            disabled={true}
          >
            Waiting
          </button>)
      case STATUS.Accepted:
        return (<div className="flex justify-center w-full">
            <Link to={process.env.PUBLIC_URL+"/message?usr="+props.target} className="my-auto p-1 text-green-500 hover:scale-125 duration-150"><MdMail size={28}/></Link>
          </div>)
      default:
        return(
          <>#empty</>
        )
    }
  }
}

export default CttStatus