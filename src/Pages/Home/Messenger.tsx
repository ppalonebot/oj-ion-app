import React from 'react';
import { User } from '../../Entity/User/User_model';
import { myContext } from '../../lib/Context';
import { ContactDict } from './Main';
import TextAreaForm from '../../Components/TextAreaForm/TextAreaForm';
import { MdSend } from 'react-icons/md';
import { Message, TargetUser } from '../../Entity/User/Contact_model';
import Balloon from '../../Components/Balloon/Ballon';
import { messageLimit } from '../../global';

export type MessengerProps = {
  user:User;
  setNavTitle?: (t:string) => void
  setNavSubTitle?: (t:string) => void
  target:ContactDict
}

const Messenger: React.FC<MessengerProps> = (props) => {
  const ctx = React.useContext(myContext)
  const searchParams = new URLSearchParams(window.location.search)
  const owner = searchParams.get('usr')??""
  const [target] = React.useState<ContactDict>(props.target)
  const [newMessage, setNewMessage] = React.useState('')
  const msgRef = React.useRef<HTMLDivElement>(null)
  const [btnLoad,setBtnLoad] = React.useState(false)

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
  
  React.useLayoutEffect(() => {
    if (hasMountedRef.current) return
    if (msgRef.current) {
      if (target[owner]){
        if (target[owner].datas.firstLoad){
          msgRef.current.scrollTop = msgRef.current.scrollHeight 
          target[owner].datas.firstLoad = false
          return
        }
        if (target[owner].datas.topMsgTimeId && target[owner].datas.topMsgTimeId !== ""){
          const element = msgRef.current!.querySelector ('#id'+target[owner].datas.topMsgTimeId) as HTMLElement
          if (element) {
            msgRef.current.scrollTop = element.offsetTop - 200
          }
          target[owner].datas.topMsgTimeId = ""
        } else {
        msgRef.current.scrollTop = target[owner].datas.scroll >= 100? 
          msgRef.current.scrollHeight : ((msgRef.current.scrollTop / (msgRef.current.scrollHeight - msgRef.current.clientHeight)) * 100) >= 90 ?  
            msgRef.current.scrollHeight : ((target[owner].datas.height - msgRef.current.scrollHeight+20)+(target[owner].datas.scroll/100*(msgRef.current.scrollHeight - msgRef.current.clientHeight)))
        }
        target[owner].datas.height = msgRef.current.scrollHeight
      }else{
        msgRef.current.scrollTop = msgRef.current.scrollHeight 
      }
    }

  }, []);

  React.useEffect(()=>{
    if (hasMountedRef.current) return
    hasMountedRef.current = true;

    if (props.setNavTitle) props.setNavTitle( target[owner] ? target[owner].name : "@"+owner)
    if (props.setNavSubTitle && target[owner]) props.setNavSubTitle( target[owner].datas.wsStatus)
    if (ctx.WS !== null && owner && !target[owner]) ctx.WS.send(JSON.stringify({ action: 'join-room-private', message: owner}));

    return
  },[])

  const handleScroll = () => {
    if (target[owner] && msgRef.current) {
      target[owner].datas.scroll = (msgRef.current.scrollTop / (msgRef.current.scrollHeight - msgRef.current.clientHeight)) * 100;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(null)
    } else if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      setNewMessage(newMessage + "\n");
    }
  };

  const loadMoreMessage = () =>{
    if (target[owner] && target[owner].datas.page >=0 && ctx.WS){
      setBtnLoad(true)
      let page = target[owner].datas.page + Math.floor(target[owner].datas.newMsgCount/messageLimit) +1
      let msg = JSON.stringify({
        action: 'get-msg',
        message: page+","+messageLimit,
        target: {
          id: target[owner].datas.room.id,
          name: target[owner].datas.room.name
        }
      } as Message)

      if (target[owner].datas.messages.length> 0) target[owner].datas.topMsgTimeId = target[owner].datas.messages[0].id
      ctx.WS.send(msg)
    }

  }

  return (
    <div className="h-full max-h-full flex flex-col justify-between">
      <div ref={msgRef} onScroll={handleScroll} className="flex-1 overflow-auto flex justify-center w-full">
        <div className="max-w-3xl w-full">
          <div className='h-10 w-full'>
          {!btnLoad && target[owner] && target[owner].datas.page >=0 && <button onClick={loadMoreMessage} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Load</button>}
          </div>
          {target[owner] && target[owner].datas.messages.map(message => (
            
            message.sender!.username === props.user.username ? 
            <div key={message.time} id={"id"+message.id} className='flex flex-row justify-end p-2'><Balloon isLeft={false}>{message.message}</Balloon></div> :
            <div key={message.time} id={"id"+message.id} className='flex flex-row justify-start p-2'><Balloon isLeft={true}>{message.message}</Balloon></div> 
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