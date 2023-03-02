import React from "react";
import TextAreaForm from "./TextAreaForm/TextAreaForm";
import { MdSend } from "react-icons/md";
import { myContext } from "../lib/Context";
import { ContactDict, Message, TargetUser } from "../Entity/User/Contact_model";
import { JsonRPC2 } from "../lib/MyJsonRPC2";
import { User } from "../Entity/User/User_model";

type Props = {
  user:User;
  target:ContactDict
}

const ChatInput: React.FC<Props> = (props) => {
  const ctx = React.useContext(myContext)
  const searchParams = new URLSearchParams(window.location.search)
  const owner = searchParams.get('usr')??""
  const [target] = React.useState<ContactDict>(props.target)
  const [isFriend, setIsFriend] = React.useState<boolean>(target[owner] && target[owner].datas && target[owner].datas.isFriend)
  const inputRef = React.useRef<HTMLTextAreaElement| null>(null);
  const [newMessage, setNewMessage] = React.useState<string>(target[owner] && target[owner].datas && target[owner].datas.inputMsg ? target[owner].datas.inputMsg! : "")
  const [selectionStart, setSelectionStart] = React.useState<number>(target[owner] && target[owner].datas && target[owner].datas.selectionStart ? target[owner].datas.selectionStart! : 0)
  const [selectionEnd, setSelectionEnd] = React.useState<number>(target[owner] && target[owner].datas && target[owner].datas.selectionEnd? target[owner].datas.selectionEnd! : 0)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement> | null) => {
    if (event) event.preventDefault();
    
    if (newMessage !== "" && ctx.Comm && target[owner]  && target[owner].datas.room) {
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
      ctx.Comm.notify('send-message',_msg)

      // setTimeout(()=>{
      //   ctx.WS!.send(msg);
      // }, 5000)

      _msg.sender = {username:props.user.username} as TargetUser

      target[owner].datas.messages.push(_msg)
      target[owner].datas.inputMsg = ""
      setNewMessage("")
    }
    else{
      console.log(target[owner])
    }
  };

  const handleFocus = (isFocus:boolean) =>{
    if (target[owner] && inputRef.current) {
      target[owner].datas.isInputFocus = isFocus
      // target[owner].datas.selectionStart = (inputRef.current.selectionStart);
      // target[owner].datas.selectionEnd = (inputRef.current.selectionEnd);
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(null)
    } else if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      setNewMessage(newMessage + "\n");
    }
  }

  const setMessage = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (event){
      let msg = event.target.value.substring(0,500)
      if (target[owner]) {
        target[owner].datas.inputMsg = msg
        target[owner].datas.selectionStart = event.target.selectionStart
        target[owner].datas.selectionEnd = event.target.selectionEnd
      }
      setNewMessage(msg)
      setSelectionStart(event.target.selectionStart)
      setSelectionEnd(event.target.selectionEnd)
    }
  }

  const hasMountedRef = React.useRef(false);
  React.useEffect(()=>{
    if (hasMountedRef.current) return
    hasMountedRef.current = true;

    if (inputRef.current && target[owner] && target[owner].datas.isInputFocus){
      inputRef.current.focus();
      inputRef.current.setSelectionRange(selectionStart, selectionEnd);
    }

    return
  },[])

  return(
    <div className='w-full md:p-3 p-2 bg-esecondary-color'>
      {isFriend && <form onSubmit={handleSubmit} className='flex flex-row gap-2 items-center'>
        <TextAreaForm className='flex-1' 
          name='message' 
          placeholder={'type new message'} 
          value={newMessage}
          rows={2}
          onChange={setMessage}
          isNotResizeable={true}
          onKeyDown={handleKeyDown}
          myref={inputRef}
          onFocus={() => handleFocus(true)}
          onBlur={() => handleFocus(false)}
        />
        <button type="submit" className='rounded-full w-14 hover:bg-blue-700 hover:bg-opacity-20 p-4 '><MdSend size={24} /></button>
      </form>}
      {!isFriend && <p>send message not available</p>}
    </div>
  )
}

export default ChatInput
