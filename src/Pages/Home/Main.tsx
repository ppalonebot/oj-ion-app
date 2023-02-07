import { useMutation, useQuery } from "react-query";
import { User } from "../../Entity/User/User_model";
import React from 'react';
import { JsonRPC2, JsonRPCresult } from "../../lib/MyJsonRPC2";
import { API_URL, API_WSURL } from "../../global";
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
import { TargetUser } from "../../Entity/User/Contact_model";

type Props = {
  user:User
  page?:string
}

export interface Dictionary {
  [key: string]: TargetUser;
}

const initialReconnectDelay = 1000
const maxReconnectDelay = 16000

const Main: React.FC<Props> = (props) => {
  const ctx = React.useContext(myContext);
  
  const [navTitle,setNavTitle] = React.useState<string>("Home")
  const [userself, setUserself] = React.useState<User>(props.user)
  const [rpc, setRpc] = React.useState<JsonRPC2>(new JsonRPC2("GetSelf",{"uid":userself.uid}))
  const [wsstatus,setWsstatus] = React.useState("idle")
  const [currentReconnectDelay, setCurrentReconnectDelay] = React.useState(0)
  const [contact, setContact] = React.useState<Dictionary>({})
  const [isWsConnected, setIsWsConnected] = React.useState(false)

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
          let socket = new WebSocket(API_WSURL + "/ws?jwt=" + data.result.jwt)
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

      switch (msg.action) {
        case "info":
          handleInfo(msg)
          break;
        // case "send-message":
        //   this.handleChatMessage(msg);
        //   break;
        // case "user-join":
        //   this.handleUserJoined(msg);
        //   break;
        // case "user-left":
        //   this.handleUserLeft(msg);
        //   break;
        // case "room-joined":
        //   this.handleRoomJoined(msg);
        //   break;
        default:
          break;
      }
    }
  }

  const handleInfo = (msg:any) => {
    contact[msg.sender.username] = msg.sender as TargetUser
    setContact(contact)
    if (getParam('usr') === msg.sender.username && window.location.pathname === '/message') {
      setNavTitle(msg.sender.name)
    }
  }

  function onWebsocketOpen(e: Event) {
    console.log("connected to WS!")
    setCurrentReconnectDelay(1000)
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
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={-3} title={navTitle} target={contact}>
          <Messenger key={isWsConnected+window.location.search} user={userself} setNavTitle={setNavTitle} target={contact} isConnected={isWsConnected}/>
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
          <SearchUser key={window.location.search} user={userself} setNavTitle={setNavTitle}/>
        </Nav>)
    default:
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={0} title={navTitle} target={contact}>
          <div className='p-4 flex flex-col justify-start items-center'>
          {
            isLoading? <p className='text-center mt-10'>Loading...</p> :
            error? <p className='text-center mt-10'>Error:  {(error as { message: string }).message}</p> :
            <>
            
            <p className='text-center mt-10'>Welcome {userself.name}</p>
            <div className="mt-4 w-full flex justify-center gap-1">
              <Link 
                to={process.env.PUBLIC_URL+"/profile"} 
                className="text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                My Profile
              </Link>
              <button
                type="button"
                className="text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={logout}
              >
                Logout
              </button>
            </div>

            </>
          }
          </div>
          <FriendReqs user={userself} setNavTitle={setNavTitle} />
        </Nav>
      );
  }
};

export default Main;