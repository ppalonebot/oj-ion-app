import React from 'react';
import { User } from '../../Entity/User/User_model';
import { myContext } from '../../lib/Context';
import { ContactDict } from './Main';
import TextAreaForm from '../../Components/TextAreaForm/TextAreaForm';
import { MdSend } from 'react-icons/md';
import { Message, TargetUser } from '../../Entity/User/Contact_model';
import Balloon from '../../Components/Balloon/Ballon';

export type MessengerProps = {
  user:User;
  setNavTitle?: (t:string) => void
  setNavSubTitle?: (t:string) => void
  target:ContactDict
}

const Messenger: React.FC<MessengerProps> = (props) => {
  const ctx = React.useContext(myContext);
  const searchParams = new URLSearchParams(window.location.search);
  const [owner, setOwner] = React.useState<string>(searchParams.get('usr')??"");

  const [target,setTarget] = React.useState<ContactDict>(props.target)
  // const [messages,setMessages] = React.useState<Array<Message>>([])
  const [newMessage, setNewMessage] = React.useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement> | null) => {
    if (event) event.preventDefault();
    if (newMessage !== "" && ctx.WS && target[owner]  && target[owner].datas.room) {
      let _msg = {
        action: 'send-message',
        message: newMessage,
        target: {
          id: target[owner].datas.room.id,
          name: target[owner].datas.room.name
        },
        status:"sent",
        time:(new Date()).toISOString()
      } as Message
      let msg = JSON.stringify(_msg)

      console.log(msg)

      ctx.WS.send(msg);

      _msg.sender = {username:props.user.username} as TargetUser

      target[owner].datas.messages.push(_msg)
      setNewMessage("")

    }
    else{
      console.log(target[owner])
    }
  };

  const hasMountedRef = React.useRef(false);
  
  React.useEffect(()=>{

    if (hasMountedRef.current) return
    hasMountedRef.current = true;

    if (props.setNavTitle) props.setNavTitle( target[owner] ? target[owner].name : "@"+owner)
    if (props.setNavSubTitle && target[owner]) props.setNavSubTitle( target[owner].datas.wsStatus)
    if (ctx.WS !== null && owner && !target[owner]) ctx.WS.send(JSON.stringify({ action: 'join-room-private', message: owner}));

    return
  },[])


  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(null)
    } else if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      setNewMessage(newMessage + "\n");
    }
  };

  return (
    <div className="h-full max-h-full flex flex-col justify-between">
      <div className="flex-1 overflow-auto flex justify-center w-full">
        <div className="max-w-3xl w-full">
          {target[owner] && target[owner].datas.messages.map(message => (
            
            message.sender!.username === props.user.username ? 
            <div key={message.time} className='flex flex-row justify-end p-2'><Balloon isLeft={false}>{message.message}</Balloon></div> :
            <div key={message.time} className='flex flex-row justify-start p-2'><Balloon isLeft={true}>{message.message}</Balloon></div> 
          ))}
        </div>
      </div>
      <div className='w-full md:p-3 p-2 bg-esecondary-color'>
        <form onSubmit={handleSubmit} className='flex flex-row gap-2 items-center'>
          <TextAreaForm className='flex-1' 
            name='message' 
            placeholder={'type new message'} 
            value={newMessage}
            rows={2}
            onChange={event => setNewMessage(event.target.value)}
            isNotResizeable={true}
            onKeyDown={handleKeyDown}
          />
          <button type="submit" className='rounded-full w-14 hover:bg-blue-700 hover:bg-opacity-20 p-4 '><MdSend size={24} /></button>
        </form>
      </div>
    </div>
  );
};
export default Messenger;