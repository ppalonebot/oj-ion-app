import React , {Fragment} from "react";
import { useMutation } from "react-query";
import { API_URL } from "../global";
import { JsonRPC2 } from "../lib/MyJsonRPC2";
import { MdExpandMore, MdMail, MdPersonRemove, MdVideocam } from "react-icons/md";
import { STATUS } from "../Entity/Enum";
import { Contact } from "../Entity/User/Contact_model";
import { Link } from "react-router-dom";
import { myContext } from "../lib/Context";
import { Popover, Transition } from "@headlessui/react";

type Props = {
  uid:string;
  target:string;
  contact:Contact|null;
  isShowAll?:boolean;
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
          if ((data.result as Contact).status === STATUS.Accepted &&  ctx.FriendReqsCount > 0){
            ctx.FriendReqsCount -= 1
          }
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
        return (<>
          {!props.isShowAll ? <div className="flex justify-center w-full">
            <Popover className="relative">
              <Popover.Button>
                <div 
                  className="my-auto p-1 text-eprimary-color hover:scale-125 duration-150 ui-open:rotate-180 ui-open:transform"
                  title="Menu">
                <MdExpandMore size={28} />
                </div>
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Popover.Panel className="w-48 z-10 absolute p-2 flex flex-col bg-eprimary-color rounded-md top-3 right-0 text-black">
                  <Link to={process.env.PUBLIC_URL+"/echo?usr="+props.target} className="flex flex-row items-center gap-2 my-auto p-2 hover:bg-black rounded-md duration-150 hover:bg-opacity-20"><MdVideocam size={28}/>Video calling</Link>
                  <Link to={process.env.PUBLIC_URL+"/message?usr="+props.target} className="flex flex-row items-center gap-2 my-auto p-2 hover:bg-black rounded-md duration-150 hover:bg-opacity-20"><MdMail size={28}/>Send message</Link>
                  <button 
                    className="my-auto p-2 hover:bg-black rounded-md duration-150 hover:bg-opacity-20"
                    disabled={status === 'loading'}
                    onClick={rmvBtnClicked}
                    >
                    {status === 'loading'? "Sending...":<span className="flex flex-row items-center gap-2"><MdPersonRemove size={28} />Remove contact</span>}
                  </button>
                </Popover.Panel>
              </Transition>
            </Popover>
          </div> :
          <div className="flex justify-center w-full">
            <button 
              className="my-auto p-2 text-red-500 hover:scale-125 duration-150"
              disabled={status === 'loading'}
              onClick={rmvBtnClicked}
              title="Remove contact">
              {status === 'loading'? "Sending...":<MdPersonRemove size={28} />}
            </button>
            <Link to={process.env.PUBLIC_URL+"/message?usr="+props.target} className="my-auto p-2 text-green-500 hover:scale-125 duration-150" title="Send messages"><MdMail size={28}/></Link>
            <Link to={process.env.PUBLIC_URL+"/echo?usr="+props.target} className="my-auto p-2 text-eprimary-color hover:scale-125 duration-150" title="Video calling"><MdVideocam size={28}/></Link>
          </div>}
        </>)
      default:
        return(
          <>#empty</>
        )
    }
  }
}

export default CttStatus