import { createContext, useState, FC } from "react";
import { TargetUser } from "../Entity/User/Contact_model";

type ContextData = {
  WS:WebSocket|null;
  SetWs: (ws: WebSocket | null)=> void
  ContactData:{ [key: string]: TargetUser };
  SetContactData: (d : { [key: string]: TargetUser }) => void
}
const myContext = createContext<ContextData>({} as ContextData);

type Props = {
  children:React.ReactNode
}

const MyProvider: FC<Props> = (props) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [targetData, setTargetData] = useState<{ [key: string]: TargetUser }>({})

  return (
      <myContext.Provider value={{WS:ws,SetWs:setWs, ContactData:targetData, SetContactData: setTargetData}}>
        {props.children}
      </myContext.Provider>
  );
}

export {myContext, MyProvider}