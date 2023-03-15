import { createContext, useState, FC } from "react";
import { LastMessages, TargetUser, UserResult } from "../Entity/User/Contact_model";
import JsonRPCSignal from "./JsonRPCSignal";
import OjClient from "./OjClient";
import { LocalStream } from "ion-sdk-js";

type ContextData = {
  Comm:JsonRPCSignal|null;
  SetComm: (o: JsonRPCSignal | null)=> void
  RoomData:{ [key: string]: TargetUser };
  Chats:{ [key: number]: Array<LastMessages> };
  ChatsLastUpdate:{ [key: number]: Date };
  Friends:{ [key: number]: Array<UserResult> };
  FriendPageLastUpdate:{ [key: number]: Date };
  FriendReqs:{ [key: number]: Array<any> };
  FriendReqsLastUpdate:{ [key: number]: Date };
  FriendReqsCountLastUpt: Date | null;
  FriendReqsCount : number;
  VicallCli: OjClient| null;
  WebCam: LocalStream| null;
  SharedScreen: LocalStream| null;
}
const myContext = createContext<ContextData>({} as ContextData);

type Props = {
  children:React.ReactNode
}

const MyProvider: FC<Props> = (props) => {
  const [comm, setComm] = useState<JsonRPCSignal | null>(null);
  // const [roomData] = useState<{ [key: string]: TargetUser }>({})
  // const [chatsData] = useState<{ [key: number]: Array<LastMessages> }>({})
  // const [chatsLastUpdate] = useState<{ [key: number]: Date }>({})
  // const [friendsData] = useState<{ [key: number]: Array<UserResult> }>({})
  // const [firendPageLastUpdate] = useState<{ [key: number]: Date }>({})
  // const [friendsReqs] = useState<{ [key: number]: Array<any> }>({})
  // const [firendReqsLastUpdate] = useState<{ [key: number]: Date }>({})
  // const [friendReqsCountLastUpt] = useState<Date | null>(null);
  // const [friendReqsCount] = useState<number>(0);
  // const [vicallCli] = useState<OjClient| null>(null)

  return (
    <myContext.Provider value={{
        Comm: comm,
        SetComm: setComm,
        RoomData:{}, 
        Chats: {}, 
        ChatsLastUpdate: {},
        Friends: {},
        FriendPageLastUpdate: {},
        FriendReqs : {},
        FriendReqsLastUpdate: {},
        FriendReqsCountLastUpt: null,
        FriendReqsCount: 0,
        VicallCli: null,
        WebCam:null,
        SharedScreen: null,
      }}>
      {props.children}
    </myContext.Provider>
  );
}

export {myContext, MyProvider}