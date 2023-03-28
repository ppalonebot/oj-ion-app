import { useMutation, useQuery } from "react-query";
import { User } from "../../Entity/User/User_model";
import React from 'react';
import { JsonRPC2, JsonRPCresult } from "../../lib/MyJsonRPC2";
import { API_URL, API_WSURL } from "../../global";
import Profile from "./Profile";
import Nav from "../../Components/Nav/Nav";
import AvatarDetail from "./AvatarDetail";
import ProfileEdit from "./ProfileEdit";
import SearchUser from "./SearchUser";
import ImageDetail from "./ImageDetail";
import Messenger from "../../Components/Messenger";
import { myContext } from "../../lib/Context";
import { ContactDict} from "../../Entity/User/Contact_model";
import Chats from "./Chats";
import FriendReqs from "./FriendReqs";
import ChatInput from "../../Components/ChatInput";
import JsonRPCSignal from "../../lib/JsonRPCSignal";
import Echo from "../../Components/Echo";
import { useNavigate } from "react-router-dom";

type Props = {
  user:User
  page?:string
}

const initialReconnectDelay = 1000
const maxReconnectDelay = 16000

const Main: React.FC<Props> = (props) => {
  const navigate = useNavigate()
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
  const [updatedChats, setUpdatedChats] = React.useState(new Date())
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  // let socket : WebSocket | null = null
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
          ctx.Comm = new JsonRPCSignal(
            API_WSURL + "/ws?jwt=" + data.result.jwt,
            userself,
            isWsConnected, 
            setIsWsConnected,
            currentReconnectDelay,
            setCurrentReconnectDelay,
            reconnectWs,
            contact,
            setContact,
            updateMessagePage,
            updateChatPage,
            wsErrorHandle,
          )
          ctx.SetComm(ctx.Comm)
				}
				else{
          console.log("no data result")
          console.log(data)
				}
			},
			onError: (error, v, ctx) => {
        setWsstatus("error")
        setTimeout(wsErrorHandle,14000)
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

  const clrTO = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null
    }
  }

  const updateMessagePage = (u:string,t:string, st:string) => {
    if (getParam('usr') === u && (window.location.pathname === '/message' || window.location.pathname === '/echo')) {
      setNavTitle(t)
      setNavSubTitle(st)
    }
    setUpdated(new Date())
  }

  const updateChatPage = () => {
    if (timeoutRef.current !== null) {
      return
    }

    timeoutRef.current = setTimeout(() => {
      const currentDate = new Date();
      const fiveMinutesEarlier = new Date(currentDate.getTime() - (6 * 60 * 1000));
      const p = isNaN(parseInt(getParam("p") ?? "1")) ? 1 : parseInt(getParam("p") ?? "1");
      ctx.ChatsLastUpdate[p] = fiveMinutesEarlier
      if ((window.location.pathname === '/' || window.location.pathname === '/message') && p === 1){
        setUpdatedChats(currentDate)
      }
      clrTO()
    }, 4000);
  }

  const reconnectWs = ()=>{
    if (wsstatus !== 'loading'){
      console.log("reconnectWS")
      setWsstatus('loading')
      getwebsockettoken(props.user.uid)
    }
  }

  const wsErrorHandle = () => {
    navigate('/503',{ replace: true });
  }

  const getParam = (key:string) =>{
    return new URLSearchParams(window.location.search).get(key)??""
  }

  if (window.location.pathname !== '/echo'){
    if (ctx.WebCam) {
      console.log("turn off webcam")
      const tracks = ctx.WebCam.getTracks()
      if (tracks) tracks.forEach(track => {
        track.stop()
        console.log("stop",track.id, track.kind)
      });
      ctx.WebCam.unpublish()
      ctx.WebCam = null
    }

    if (ctx.SharedScreen) {
      console.log("close shared screen")
      const tracks = ctx.SharedScreen.getTracks()
      if (tracks) tracks.forEach(track => {
        track.stop()
        console.log("stop",track.id, track.kind)
      });
      ctx.SharedScreen.unpublish()
      ctx.SharedScreen = null
    }
    
    if (ctx.VicallCli) {
      console.log("hang up vicall")
      ctx.VicallCli.leave()
      if (ctx.Comm) ctx.Comm.notify("leave-vicall","true")
      ctx.VicallCli = null
    }
  }
  
  const hasMountedRef = React.useRef(false);
  React.useEffect(()=>{
    if (hasMountedRef.current) return
    hasMountedRef.current = true;

    reconnectWs()

    return
  },[])

  React.useEffect(()=>{
    if (ctx.Comm){
      ctx.Comm.currentUser = userself
      ctx.Comm.isWsConnected = isWsConnected
      ctx.Comm.setIsWsConnected = setIsWsConnected
      ctx.Comm.currentReconnectDelay = currentReconnectDelay
      ctx.Comm.setCurrentReconnectDelay = setCurrentReconnectDelay
      ctx.Comm.reconnectWs = reconnectWs
      ctx.Comm.contact = contact
      ctx.Comm.setContact = setContact
      ctx.Comm.updateMessagePage = updateMessagePage
      ctx.Comm.updateChatPage = updateChatPage
    }
  }, [userself,isWsConnected,currentReconnectDelay,contact]);

  switch (props.page) {
    case 'echo':
      let kn = contact[getParam('usr')]?.datas?.room?.id ?? "";
      return (<Echo key={kn} isLoading={isLoading} error={error} target={contact} user={userself} setUpdated={setUpdated}>
          <Messenger key={isWsConnected+getParam('usr')+updated} user={userself} target={contact}/>
          <ChatInput user={userself} target={contact} setUpdated={setUpdated}/>
        </Echo>)
    case 'message':
      return (<Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={-3} title={navTitle} subtitle={navSubTitle} target={contact}>
          <div className="flex flex-row h-full max-h-full">
            <div className="h-full max-h-full flex flex-col justify-between md:w-1/2 w-full">
              <Messenger key={isWsConnected+getParam('usr')+updated} user={userself} setNavTitle={setNavTitle} setNavSubTitle={setNavSubTitle} target={contact}/>
              <ChatInput key={navTitle} user={userself} target={contact} setUpdated={setUpdated}/>
            </div>
            <div className="h-full max-h-full md:flex w-1/2 hidden">
              <Chats key={window.location.search+updatedChats} user={userself} setNavTitle={setNavTitle} />
            </div>
          </div>
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
    case 'friendrequest':
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={-4} title={navTitle} target={contact}>
          <FriendReqs key={window.location.search} user={userself} setNavTitle={setNavTitle} />
        </Nav>)
    default:
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={0} title={navTitle} target={contact}>
          {
            isLoading? <p className='text-center mt-10'>Loading...</p> :
            error? <p className='text-center mt-10'>Error:  {(error as { message: string }).message}</p> :
            <>
            <Chats key={window.location.search+updatedChats} user={userself} setNavTitle={setNavTitle} />
            </>
          }
        </Nav>)
  }
};

export default Main;