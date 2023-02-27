import React from "react";
import { useMutation } from "react-query";
import { API_URL } from "../global";
import { JsonRPC2 } from "../lib/MyJsonRPC2";
import { MdMail, MdPersonRemove } from "react-icons/md";
import { STATUS } from "../Entity/Enum";
import { Contact } from "../Entity/User/Contact_model";
import { Link } from "react-router-dom";
import { myContext } from "../lib/Context";

type Props = {
  uid:string;
  target:string;
  contact:Contact|null;
}

const CttStatus: React.FC<Props> = (props) => {
  const ctx = React.useContext(myContext);
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
      onSuccess: (data,v ,c) => {
        if (data.id === props.uid && data.result){
          let p = parseInt(new URLSearchParams(window.location.search).get('p')??"1")
          if (ctx.Friends && ctx.Friends[p]){
            for (let i = 0; i < ctx.Friends[p].length; i++) {
              if (ctx.Friends[p][i].username === props.target ){
                ctx.Friends[p][i].contact = null
              }
            }
          }
          setContact(null)
        }
        else if (data.result.to){
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
  const setFriend = mutationResult.mutate;
  const status = mutationResult.status;

  const addBtnClicked = () =>{
    const rpc : JsonRPC2 = new JsonRPC2("AddContact",{uid:props.uid,to_usr:props.target})
    setFriend(rpc)
  }

  const rmvBtnClicked = () =>{
    const rpc : JsonRPC2 = new JsonRPC2("RemoveContact",{uid:props.uid,to_usr:props.target})
    rpc.id = props.uid
    setFriend(rpc)
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
            title="Add contact"
          >
            {status === 'loading'? "Sending...":"Accept"}
          </button>)
      case STATUS.Waiting:
        return (
          <button 
            className="bg-slate-700 text-white rounded h-8 w-full my-auto"
            disabled={true}
            title="please wait"
          >
            Waiting
          </button>)
      case STATUS.Accepted:
        return (<div className="flex justify-center w-full">
            <button 
              className="my-auto p-1 text-red-500 hover:scale-125 duration-150"
              disabled={status === 'loading'}
              onClick={rmvBtnClicked}
              title="Remove contact"
            >
              {status === 'loading'? "Sending...":<MdPersonRemove size={28} />}
            </button>
            <Link to={process.env.PUBLIC_URL+"/message?usr="+props.target} className="my-auto p-1 text-green-500 hover:scale-125 duration-150" title="Send message"><MdMail size={28}/></Link>
          </div>)
      default:
        return(
          <>#empty</>
        )
    }
  }
}

export default CttStatus