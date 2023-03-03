import { createContext, useState, FC } from "react";
import { LastMessages, TargetUser, UserResult } from "../Entity/User/Contact_model";
import JsonRPCSignal from "./JsonRPCSignal";

type ContextData = {
  Comm:JsonRPCSignal|null;
  SetComm: (o: JsonRPCSignal | null)=> void
  // WS:WebSocket|null;
  // SetWs: (ws: WebSocket | null)=> void
  RoomData:{ [key: string]: TargetUser };
  SetRoomData: (d : { [key: string]: TargetUser }) => void
  Chats:{ [key: number]: Array<LastMessages> };
  ChatsLastUpdate:{ [key: number]: Date };
  Friends:{ [key: number]: Array<UserResult> };
  FriendPageLastUpdate:{ [key: number]: Date };
  FriendReqs:{ [key: number]: Array<any> };
  FriendReqsLastUpdate:{ [key: number]: Date };
  FriendReqsCountLastUpt: Date | null;
  FriendReqsCount : number;
}
const myContext = createContext<ContextData>({} as ContextData);

type Props = {
  children:React.ReactNode
}

const MyProvider: FC<Props> = (props) => {
  const [comm, setComm] = useState<JsonRPCSignal | null>(null);
  // const [ws, setWs] = useState<WebSocket | null>(null);
  const [roomData, setRoomData] = useState<{ [key: string]: TargetUser }>({})
  const [chatsData] = useState<{ [key: number]: Array<LastMessages> }>({})
  const [chatsLastUpdate] = useState<{ [key: number]: Date }>({})
  const [friendsData] = useState<{ [key: number]: Array<UserResult> }>({})
  const [firendPageLastUpdate] = useState<{ [key: number]: Date }>({})
  const [friendsReqs] = useState<{ [key: number]: Array<any> }>({})
  const [firendReqsLastUpdate] = useState<{ [key: number]: Date }>({})
  const friendReqsCountLastUpt = null;
  const friendReqsCount = 0;

  return (
    <myContext.Provider value={{
        Comm: comm,
        SetComm: setComm,
        // WS:ws, 
        // SetWs:setWs, 
        RoomData:roomData, 
        SetRoomData: setRoomData, 
        Chats: chatsData, 
        ChatsLastUpdate: chatsLastUpdate,
        Friends: friendsData,
        FriendPageLastUpdate: firendPageLastUpdate,
        FriendReqs : friendsReqs,
        FriendReqsLastUpdate: firendReqsLastUpdate,
        FriendReqsCountLastUpt: friendReqsCountLastUpt,
        FriendReqsCount: friendReqsCount,
      }}>
      {props.children}
    </myContext.Provider>
  );
}

export {myContext, MyProvider}