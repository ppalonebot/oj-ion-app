import { createContext, useState, FC } from "react";
import { LastMessages, TargetUser } from "../Entity/User/Contact_model";

type ContextData = {
  WS:WebSocket|null;
  SetWs: (ws: WebSocket | null)=> void
  ContactData:{ [key: string]: TargetUser };
  SetContactData: (d : { [key: string]: TargetUser }) => void
  Chats:{ [key: number]: Array<LastMessages> };
  ChatsLastUpdate:{ [key: number]: Date };
  SetChats:(d : { [key: number]: Array<LastMessages> }) => void
}
const myContext = createContext<ContextData>({} as ContextData);

type Props = {
  children:React.ReactNode
}

const MyProvider: FC<Props> = (props) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [targetData, setTargetData] = useState<{ [key: string]: TargetUser }>({})
  const [chatsData, setChatsData] = useState<{ [key: number]: Array<LastMessages> }>({})
  const [chatsLastUpdate] = useState<{ [key: number]: Date }>({})

  return (
    <myContext.Provider value={{WS:ws, 
                SetWs:setWs, 
                ContactData:targetData, 
                SetContactData: setTargetData, 
                Chats: chatsData, 
                SetChats: setChatsData, 
                ChatsLastUpdate: chatsLastUpdate}}>
      {props.children}
    </myContext.Provider>
  );
}

export {myContext, MyProvider}