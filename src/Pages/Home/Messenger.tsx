import React from 'react';
import { User } from '../../Entity/User/User_model';
import { myContext } from '../../lib/Context';
import { ContactDict } from './Main';

export type MessengerProps = {
  user:User;
  setNavTitle?: (t:string) => void
  setNavSubTitle?: (t:string) => void
  target:ContactDict
}

interface Message {
  author: string;
  content: string;
  time: Date;
}

const Messenger: React.FC<MessengerProps> = (props) => {
  const ctx = React.useContext(myContext);
  const searchParams = new URLSearchParams(window.location.search);
  const [owner, setOwner] = React.useState<string>(searchParams.get('usr')??"");

  const [target,setTarget] = React.useState<ContactDict>(props.target)
  const [messages,setMessages] = React.useState<Array<Message>>([])
  const [newMessage, setNewMessage] = React.useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    // if (props.sendMessage) props.sendMessage(newMessage);
    // setNewMessage('');
    console.log(target)
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


  // if (isConnected){
  //   if (ctx.ws !== null && owner && target === null) ctx.ws.send(JSON.stringify({ action: 'join-room-private', message: owner}));
  // }

  return (
    <div className="messenger-page">
      <p>{ target[owner] ? target[owner].name:"null"}</p>
      <div className="message-history">
        {messages && messages.map(message => (
          <div className="message" key={message.time.toISOString()}>
            <div className="message-author">{message.author}:</div>
            <div className="message-content">{message.content}</div>
            <div className="message-time">{message.time.toLocaleString()}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={event => setNewMessage(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
export default Messenger;