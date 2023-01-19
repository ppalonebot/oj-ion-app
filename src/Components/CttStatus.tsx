import React from "react";
import { useMutation } from "react-query";
import { API_URL } from "../global";
import { JsonRPC2 } from "../lib/MyJsonRPC2";

type Props = {
  uid:string;
  target:string;
  contact:Contact|null;
}

export type Contact = {
  owner: string;
  to: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CttStatus: React.FC<Props> = (props) => {
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
    const rpc : JsonRPC2 = new JsonRPC2("CreateContact",{uid:props.uid,to_usr:props.target})
    addFirend(rpc)
  }

  if (!props.contact || props.contact.status === "pending") {
    return(
      <button 
        className="bg-blue-500 text-white rounded hover:bg-blue-700 h-8 w-full ml-2 my-auto"
        disabled={status === 'loading'}
        onClick={addBtnClicked}
      >
        Add
      </button>
    )
  } else return (<div>ok</div>)
}

export default CttStatus