import { useMutation, useQuery } from "react-query";
import { User } from "../../Entity/User/User_model";
import React from 'react';
import { JsonRPC2, JsonRPCresult } from "../../lib/MyJsonRPC2";
import { API_URL, API_WSURL, messageLimit } from "../../global";
import { Link } from "react-router-dom";
import Profile from "./Profile";
import Nav from "../../Components/Nav/Nav";
import AvatarDetail from "./AvatarDetail";
import ProfileEdit from "./ProfileEdit";
import SearchUser from "./SearchUser";
import ImageDetail from "./ImageDetail";
import FriendReqs from "../../Components/FriendReqs";
import Messenger from "./Messenger";
import { myContext } from "../../lib/Context";
import { ContactData, Message, Messages, Room, TargetUser } from "../../Entity/User/Contact_model";
import Chats from "../../Components/Chats";

type Props = {
  user:User
  page?:string
}

export interface ContactDict {
  [key: string]: TargetUser;
}

const initialReconnectDelay = 1000
const maxReconnectDelay = 16000

const Main: React.FC<Props> = (props) => {
  const ctx = React.useContext(myContext);
  
  const [navTitle,setNavTitle] = React.useState<string>("Home")
  const [navSubTitle,setNavSubTitle] = React.useState<string>("")
  const [userself, setUserself] = React.useState<User>(props.user)
  const [rpc, setRpc] = React.useState<JsonRPC2>(new JsonRPC2("GetSelf",{"uid":userself.uid}))
  const [wsstatus,setWsstatus] = React.useState("idle")
  const [currentReconnectDelay, setCurrentReconnectDelay] = React.useState(initialReconnectDelay)
  const [contact, setContact] = React.useState<ContactDict>({})
  const [isWsConnected, setIsWsConnected] = React.useState(false)
  const [updated, setUpdated] = React.useState(new Date())
  let socket : WebSocket | null = null
  const { isLoading, error, refetch } = useQuery(
    'GetSelf',
    () => fetch(API_URL+'/usr/rpc',
    {
      method: 'POST',
      body: JSON.stringify(rpc),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json','credentials': 'true' }
    }).then(res => res.json()),
    {
      staleTime: 60 * 1000, // consider data stale after 60 seconds
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      refetchInterval: 5*60 * 1000,
      cacheTime: 5*60 * 1000,
      onError(err) {
        console.log("error")
        console.log(err)
        logout()
      },
      onSuccess(data) {
        // console.log(data)
        if (data){
          if (data.result){
            let u = (data as JsonRPCresult).result as User
            let user =  new User(u.uid,u.name, u.username,u.email,u.jwt,u.isregistered,u.avatar)
            user.save()
            setUserself(user)
            if (rpc.method !== "GetSelf"){
              setRpc({...rpc,method:"GetSelf"})
            }
          }
          else{
            if (rpc.method === "GetSelf"){
              refreshToken()
            } else {
              logout()
            }
          }
        }  
      },
    }
  )

  const websockettokenMutation  = useMutation(
		(uid:string) => fetch(API_URL+'/prf/rpc', {
			method: 'POST',
			body: JSON.stringify(new JsonRPC2("GetWebsocketToken",{"uid":uid})),
			credentials: "include",
			headers: { 
				'Content-Type': 'application/json'
			}
		}).then(res => {
			return res.json()
		}),
		{
			onSuccess: (data,v ,c) => {
        setWsstatus("success")
				if (data.result !== null){
          socket = new WebSocket(API_WSURL + "/ws?jwt=" + data.result.jwt)
          socket.addEventListener('open', (event) => { onWebsocketOpen(event) });
          // socket.addEventListener('message', (event) => { handleNewMessage(event) });
          socket.addEventListener('close', (event) => { onWebsocketClose(event) });
          socket.onmessage = handleNewMessage
          ctx.SetWs(socket)
				}
				else{
          console.log("no data result")
          console.log(data)
				}
			},
			onError: (error, v, ctx) => {
        setWsstatus("error")
				console.log(error)
			}
		}
	)
	
	const getwebsockettoken = websockettokenMutation.mutate

  const refreshToken = () =>{
    setRpc({...rpc,method:"RefreshToken"})
    setTimeout(function() {
      refetch()
    }, 200);
  }

  const logout = () =>{
    // Delete all cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });

    // Delete all items from local storage
    localStorage.clear();

    setTimeout(function() {
      window.location.reload();
    }, 300);
  }

  const handleNewMessage = (event: MessageEvent<any>) => {
    let data = event.data;
    
    data = data.split(/\r?\n/)
    for (let i = 0; i < data.length; i++) {
      let msg = JSON.parse(data[i]);

      // if (msg.sender){
      //   msg["sender_id"] = msg.sender.id
      //   msg["sender_name"] = msg.sender.name
      // }
      console.log(msg)
      switch (msg.action) {
        case "read":
          handleHasBeenRead(msg)
          break;
        case "delv":
          handleDelivered(msg)
          break;
        case "get-msg":
          handleGetMessage(msg)
          break;
        case "send-message":
          handleChatMessage(msg);
          break;
        case "user-join":
          handleUserJoined(msg);
          break;
        case "user-left":
          handleUserLeft(msg);
          break;
        case "room-joined":
          handleRoomJoined(msg)
          break;
        default:
          break;
      }
    }
  }

  const handleHasBeenRead = (msg:any) => {
    if (contact){
      let m = msg as Message
      for (const key in contact) {
        if (contact.hasOwnProperty(key)) {
          if (contact[key].datas.room.id === m.target!.id){
            contact[key].datas.updated = new Date()

            for(let i = contact[key].datas.messages.length -1; i>= 0; i--){
              if (contact[key].datas.messages[i].id 
                && contact[key].datas.messages[i].id.length > 0 
                && contact[key].datas.messages[i].id === m.message
              ){
                contact[key].datas.messages[i].id = m.message
                contact[key].datas.messages[i].status = "read"
              }
            }

            if (getParam('usr') === key && window.location.pathname === '/message'){
              setUpdated(contact[key].datas.updated)
            }
            break
          }
        }
      }
    }
  }

  const handleDelivered = (msg:any) => {
    if (contact){
      let m = msg as Messages
      for (const key in contact) {
        if (contact.hasOwnProperty(key)) {
          if (contact[key].datas.room.id === m.target!.id){
            contact[key].datas.updated = new Date()

            for(let i =0; i< contact[key].datas.messages.length; i++){
              for(let j =0; j< m.messages.length; j++)
              if (contact[key].datas.messages[i].time === m.messages[j].time){
                contact[key].datas.messages[i].id = m.messages[j].id
                contact[key].datas.messages[i].status = "delv"
              }
            }

            if (getParam('usr') === key && window.location.pathname === '/message'){
              setUpdated(contact[key].datas.updated)
            }
            break
          }
        }
      }
    }
  }

  const handleGetMessage = (msg:any) => {
    if (contact){
      let m = msg as Messages
      let found = false
      // if (m.messages.length === 0) return
      for (const key in contact) {
        if (contact.hasOwnProperty(key)) {
          if (contact[key].datas.room.id === m.target!.id){
            contact[key].datas.updated = new Date()

            if (props.user.username === m.sender!.username){
              //disable load old msg
              if (m.messages && m.messages.length < messageLimit) contact[key].datas.page =-1
              else contact[key].datas.page += 1

              for(let i = 0; i < m.messages.length;i++){
                let newMsg = {
                  id:m.messages[i].id, 
                  action:m.messages[i].action,
                  message:m.messages[i].message,
                  sender:{
                    avatar: m.messages[i].sender === props.user.username? props.user.avatar : contact[m.messages[i].sender].avatar,
                    name: m.messages[i].sender === props.user.username? props.user.name : contact[m.messages[i].sender].name,
                    username: m.messages[i].sender === props.user.username? props.user.username : contact[m.messages[i].sender].username,
                  },
                  status: m.messages[i].status,
                  target:m.target,
                  time: m.messages[i].time,
                } as Message

                let alreadyExist = false
                for(let j = 0; j < contact[key].datas.messages.length; j++){
                  if (contact[key].datas.messages[j].time === newMsg.time){
                    if (!contact[key].datas.messages[j].id){
                      contact[key].datas.messages[j] = newMsg
                      alreadyExist = true
                    }
                    else{
                      if (contact[key].datas.messages[j].id === newMsg.id){
                        contact[key].datas.messages[j] = newMsg
                        alreadyExist = true
                      }
                    }
                  }
                }

                if (!alreadyExist) contact[key].datas.messages.unshift(newMsg)
              }
            }
            if (getParam('usr') === key && window.location.pathname === '/message'){
              setUpdated(contact[key].datas.updated)
            }
            break
          }
        }
      }
      if (found) setContact(contact)
    }
  }

  const handleChatMessage = (msg:any) => {
    if (contact){
      let message = msg as Message
      let found = false
      for (const key in contact) {
        if (contact.hasOwnProperty(key)) {
          if (contact[key].datas.room.id === message.target!.id){
            
            contact[key].datas.updated = new Date()
            if (props.user.username === message.sender!.username){
              for(let i = contact[key].datas.messages.length - 1; i >= 0; i--){
                if (contact[key].datas.messages[i].time === message.time){
                  found = true
                  contact[key].datas.messages[i] = message
                  break
                }
              }
            }
            
            if (!found) contact[key].datas.messages.push(message)
            found = true
            contact[key].datas.newMsgCount +=1
            if (getParam('usr') === key && window.location.pathname === '/message'){
              setUpdated(contact[key].datas.updated)
            }
            break
          }
        }
      }
      if (found) setContact(contact)
      else {
        console.log("todo: notif to chats page and chats nav")
      }
    }
  }

  function setContactWsStatus(username: string,name:string, sta:string){
    if (contact[username]){
      contact[username].datas.wsStatus = sta
      contact[username].datas.updated = new Date()
    }
    setContact(contact)
    if (getParam('usr') === username && window.location.pathname === '/message') {
      // setNavTitle(name + " <" + (contact[username].datas.wsStatus + ">"))
      setNavTitle(name)
      setNavSubTitle(contact[username].datas.wsStatus)
    }
  }

  const handleUserJoined = (msg:any) => {
    setContactWsStatus(msg.sender.username,msg.sender.name,"online")
  }

  const handleUserLeft = (msg:any) => {
    setContactWsStatus(msg.sender.username,msg.sender.name,"offline")
  }

  const handleRoomJoined = (msg:any) => {
    if (contact[msg.sender.username]){
      if (contact[msg.sender.username].datas.firstLoad){
        let sender = msg.sender as TargetUser
        contact[msg.sender.username].avatar = sender.avatar
        contact[msg.sender.username].contact = sender.contact
        contact[msg.sender.username].name = sender.name
        contact[msg.sender.username].username = sender.username
        let m = JSON.stringify({
          action: 'get-msg',
          message: "1,"+messageLimit,
          target: {
            id: msg.target.id,
            name: msg.target.name
          }
        } as Message)
  
        socket!.send(m)
      }
      contact[msg.sender.username].datas.wsStatus = msg.message !== "" ? msg.message: contact[msg.sender.username].datas.wsStatus
      contact[msg.sender.username].datas.updated = new Date()
      contact[msg.sender.username].datas.room = msg.target as Room
      
    }
    setContact(contact)
    if (getParam('usr') === msg.sender.username && window.location.pathname === '/message') {
      // setNavTitle(msg.sender.name + " <" + (contact[msg.sender.username].datas.wsStatus + ">"))
      setNavTitle(msg.sender.name)
      setNavSubTitle(contact[msg.sender.username].datas.wsStatus)
    }
  }

  function onWebsocketOpen(e: Event) {
    console.log("connected to WS!")
    setCurrentReconnectDelay(initialReconnectDelay)
    setIsWsConnected(true)
    // let owner = getParam('usr')
    // console.log(ctx.WS)
    // if (ctx.WS !== null && owner && !contact[owner] && window.location.pathname === '/message') {
    //   ctx.WS.send(JSON.stringify({ action: 'join-room-private', message: owner}))
    // }
  }

  function onWebsocketClose(e:CloseEvent) {
    console.log("diconnected from WS!")
    setIsWsConnected(false)
    ctx.SetWs(null)

    setTimeout(() => {
      if (currentReconnectDelay < maxReconnectDelay) {
        setCurrentReconnectDelay(currentReconnectDelay*2)
      }
      if (currentReconnectDelay > 1000*64){
        setCurrentReconnectDelay(1000*64)
      }
      reconnectWs();
    }, currentReconnectDelay + Math.floor(Math.random() * 3000));

  }

  const reconnectWs = ()=>{
    if (wsstatus !== 'loading'){
      console.log("reconnectWs")
      setWsstatus('loading')
      // setConnected(false)
      getwebsockettoken(props.user.uid)
    }
  }

  const getParam = (key:string) =>{
    return new URLSearchParams(window.location.search).get(key)??""
  }

  const hasMountedRef = React.useRef(false);
  React.useEffect(()=>{

    if (hasMountedRef.current) return
    hasMountedRef.current = true;

    reconnectWs()

    return
  },[])

  switch (props.page) {
    case 'message':
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={-3} title={navTitle} subtitle={navSubTitle} target={contact}>
          <Messenger key={isWsConnected+getParam('usr')+updated} user={userself} setNavTitle={setNavTitle} setNavSubTitle={setNavSubTitle} target={contact}/>
        </Nav>);
    case 'profile':
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={-2} title={navTitle} target={contact}>
          <Profile key={window.location.search} user={userself} setNavTitle={setNavTitle}/>
        </Nav>);
    case 'profileedit':
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={-1} title={navTitle} target={contact}>
          <ProfileEdit user={userself} mainRefresh={refetch} setNavTitle={setNavTitle}/>;
        </Nav>);
    case 'avatardetail':
      return <AvatarDetail isLoading={isLoading} error={error} user={userself} mainRefresh={refetch}/>
    case 'imagedetail':
      return <ImageDetail />
    case 'searchuser':
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={1} title={navTitle} target={contact}>
          <FriendReqs user={userself} />
          <SearchUser key={window.location.search} user={userself} setNavTitle={setNavTitle}/>
        </Nav>)
    default:
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={0} title={navTitle} target={contact}>
          
          {
            isLoading? <p className='text-center mt-10'>Loading...</p> :
            error? <p className='text-center mt-10'>Error:  {(error as { message: string }).message}</p> :
            <>
            <Chats key={window.location.search} user={userself} setNavTitle={setNavTitle} />
            </>
          }
        </Nav>
      );
  }
};

export default Main;