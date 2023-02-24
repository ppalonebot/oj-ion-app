import { createContext, useState, FC } from "react";
import { LastMessages, TargetUser, UserResult } from "../Entity/User/Contact_model";

type ContextData = {
  WS:WebSocket|null;
  SetWs: (ws: WebSocket | null)=> void
  RoomData:{ [key: string]: TargetUser };
  SetRoomData: (d : { [key: string]: TargetUser }) => void
  Chats:{ [key: number]: Array<LastMessages> };
  ChatsLastUpdate:{ [key: number]: Date };
  Friends:{ [key: number]: Array<UserResult> };
  FriendPageLastUpdate:{ [key: number]: Date };
  FriendReqs:{ [key: number]: Array<any> };
  FriendReqsLastUpdate:{ [key: number]: Date };
}
const myContext = createContext<ContextData>({} as ContextData);

type Props = {
  children:React.ReactNode
}

const MyProvider: FC<Props> = (props) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [roomData, setRoomData] = useState<{ [key: string]: TargetUser }>({})
  const [chatsData] = useState<{ [key: number]: Array<LastMessages> }>({})
  const [chatsLastUpdate] = useState<{ [key: number]: Date }>({})
  const [friendsData] = useState<{ [key: number]: Array<UserResult> }>({})
  const [firendPageLastUpdate] = useState<{ [key: number]: Date }>({})
  const [friendsReqs] = useState<{ [key: number]: Array<any> }>({})
  const [firendReqsLastUpdate] = useState<{ [key: number]: Date }>({})

  return (
    <myContext.Provider value={{
        WS:ws, 
        SetWs:setWs, 
        RoomData:roomData, 
        SetRoomData: setRoomData, 
        Chats: chatsData, 
        ChatsLastUpdate: chatsLastUpdate,
        Friends: friendsData,
        FriendPageLastUpdate: firendPageLastUpdate,
        FriendReqs : friendsReqs,
        FriendReqsLastUpdate: firendReqsLastUpdate
      }}>
      {props.children}
    </myContext.Provider>
  );
}

export {myContext, MyProvider}