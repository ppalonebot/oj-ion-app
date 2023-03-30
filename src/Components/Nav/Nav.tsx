import React from "react";
import { User } from "../../Entity/User/User_model";
import Avatar from "../Avatar";
import { Link, useNavigate } from "react-router-dom";
import './style.css';
import {  MdMenu, MdClose, MdPeopleAlt, MdLens, MdOutlinePowerSettingsNew, MdKeyboardTab, MdMenuOpen, MdQuestionAnswer, MdVideocam} from 'react-icons/md';
import MyMenu, { MenuItem } from "../MyMenu";
import { API_URL } from "../../global";
// import { myContext } from "../../lib/Context";
import { ContactDict } from "../../Entity/User/Contact_model";
import Loading from "../Loading";

type Props = React.PropsWithChildren<{ 
  user: User;
  isLoading: boolean;
  error: unknown;
  index:number;
  title:string;
  subtitle?:string;
  target?:ContactDict;
  logout: () => void;
}>;

export type MainLink = {
  key: number;
  text: string;
  link: string;
  ico: JSX.Element;
}

const Nav: React.FC<Props> = (props) => {
  const [show, setShow] = React.useState(false);
  const [chCount, setChCount] = React.useState(props.target? Object.keys(props.target).length : 0);
  // const ctx = React.useContext(myContext)
  const navigate = useNavigate()

  const pages : Array<MainLink> = [
    {
      key:0,
      text:'Chats',
      link:process.env.PUBLIC_URL+"/",
      ico:<MdQuestionAnswer/>
    },
    {
      key:1,
      text:'Contacts',
      link:process.env.PUBLIC_URL+"/searchuser",
      ico:<MdPeopleAlt/>
    },
  ]

  const getParam = (key:string) =>{
    return new URLSearchParams(window.location.search).get(key)??""
  }

  const menuVideoCall = () =>{
    const active = document.querySelector("a.nav-link.active")
    if (active){
      const href = active.getAttribute("href");
      if (href && href.includes("message?")){
        const url = new URL(href!, window.location.href);
        const params = new URLSearchParams(url.search);
        const uname = params.get("usr");
        if (uname && props.target && props.target[uname]){
          if (window.location.pathname === "/message") navigate(process.env.PUBLIC_URL+'/echo?usr='+uname); 
        }
      }
    }
  }

  const menuCloseRoom = () =>{
    const active = document.querySelector("a.nav-link.active")
    if (active){
      const href = active.getAttribute("href");
      if (href && href.includes("message?")){
        const url = new URL(href!, window.location.href);
        const params = new URLSearchParams(url.search);
        const uname = params.get("usr");
        closingRoom(uname!)
      }
    }
  }

  const closeRoom = (event: React.MouseEvent<HTMLButtonElement>) =>{
    let uname = event.currentTarget.value
    closingRoom(uname)
  }

  const closingRoom = (uname: string) =>{
    if (props.target && props.target[uname]){
      // if (ctx.WS) {
      //   let msg = JSON.stringify({
      //     action: 'leave-room',
      //     message: props.target[uname].datas.room.id,
      //     target: {
      //       id: props.target[uname].datas.room.id,
      //       name: props.target[uname].datas.room.name
      //     },
      //     status:"sent",
      //     time:(new Date()).toISOString()
      //   } as Message)

      //   ctx.WS.send(msg);
      // }
      delete props.target[uname]
      setChCount(chCount-1)
      if (window.location.pathname === "/message") navigate(process.env.PUBLIC_URL+'/'); 
    }
  }

  const links: Array<MenuItem> = [
    { 
      key: "logout",
      label: "Sign Out",
      onClick:props.logout,
      title: "Sign Out from app",
      isLink: false,
      icon:<MdOutlinePowerSettingsNew size={24}/>,
    }
  ]
  if (props.children && React.isValidElement(props.children) && window.location.pathname === '/message'){
    links.push({
      key: "closeroom",
      label: "Close Room",
      onClick:menuCloseRoom,
      title: "Close room to save memory",
      isLink: false,
      icon:<MdKeyboardTab size={24}/>,
    })
    links.push({
      key: "videocall",
      label: "Video Call",
      onClick:menuVideoCall,
      title: "Start video call",
      isLink: false,
      icon:<MdVideocam size={24}/>,
    })
  }

  let userElements = [];
  let sortedUsers = [];
  for (let key in props.target) {
    if (props.target[key]) {
      sortedUsers.push(props.target[key]);
    }
  }
  sortedUsers.sort((a, b) => (a.datas.updated < b.datas.updated) ? 1 : -1);
  sortedUsers.sort((a, b) => (a.datas.wsStatus === 'online' ? -1 : 1));

  for (let user of sortedUsers) {
    userElements.push(
      <div key={user.username} className="flex flex-row items-center">
        <Link className={`w-full nav-link ${getParam('usr') === user.username && window.location.pathname === '/message' ? "active" : ""}`} to={process.env.PUBLIC_URL+"/message?usr="+user.username}>
          <i className="nav-link-icon">
            <Avatar className={"h-10 w-10 rounded-full object-cover"} src={(user.avatar !== "" ?API_URL+user.avatar:process.env.PUBLIC_URL+'/default-avatar.jpg')} alt={user.username}/>
            {user.datas.wsStatus === "online" && <p className={`absolute text-green-400 bottom-1 left-9 ${!show?"":"md:hidden"}`}><MdLens size={10}/></p>}
          </i>
          <span className="nav-link-name">{user.name}</span>
        </Link>
        {show && <span className={`absolute flex-row right-0 hidden ${show?"md:flex":""}`}>
          {user.datas.wsStatus === "online" && <span className="text-green-400 rounded-full h-8 w-8 flex justify-center items-center bg-esecondary-color bg-opacity-80"><MdLens size={10}/></span>}
          <button onClick={closeRoom} value={user.username} className="text-black hover:text-red-500 hover:cursor-pointer rounded-full h-8 w-8 flex justify-center items-center bg-esecondary-color bg-opacity-80"><MdClose size={20}/></button>
        </span>}
      </div>
    );
  }

  // const hasMountedRef = React.useRef(false);
  // React.useEffect(()=>{
  //   if (hasMountedRef.current) return
  //   hasMountedRef.current = true;

  // },[]

  return (
    <>
    {
      props.isLoading? <Loading/> :
      props.error? <p>Error:  {(props.error as { message: string }).message}</p> :
      <main className={(show ? 'lg:pl-[300px]' : '')}>
        <header className={`header ${show ? 'space-toggle' : ''}`}>
          <div className="flex gap-4 max-h-full" >
            <div onClick={() => setShow(!show)} className="header-toggle icon hover:text-elight-font-color ml-2 flex items-center">{show ? <MdMenuOpen /> : <MdMenu />}</div>
            <div>
              <div className='flex flex-row items-center'>
                {props.subtitle && <i className={`${props.subtitle !== "online"? "text-orange-700":"text-green-400"} mr-2 md:hidden`}><MdLens size={8}/></i>}
                <span className="text-esecondary-color font-semibold text-lg text-ellipsis truncate">{props.title}</span>
              </div>
              {props.subtitle && <p className="h-3 hidden md:block">
                <span className="text-xs flex flex-row items-center absolute bottom-1 text-slate-800"><i className={`${props.subtitle !== "online"? "text-orange-700":"text-green-400"} mr-1`}><MdLens size={8}/></i> {props.subtitle}</span>
              </p>}
            </div>
          </div>
          <div className="absolute right-0 h-8 md:h-auto bg-eprimary-color flex items-center justify-center bg-opacity-80">
            <MyMenu links={links}/>
          </div>
        </header>
        <aside className={`sidebar ${show ? 'show' : ''}`}>
          <nav className='nav'>
            <div>
              <Link to={process.env.PUBLIC_URL+"/profile"} className="nav-logo">
                <i className="nav-logo-icon">
                  <Avatar className={"h-10 w-10 rounded-full object-cover"} src={API_URL+(props.user.avatar?props.user.avatar:"/image/404notfound")} alt={props.user.username}/>
                </i>
                <span className="nav-logo-name">{props.user.name}</span>
              </Link>
            
              <div className='nav-list'>
                {
                  pages.map((v,i)=>{
                    return (
                      <Link key={i} className={`nav-link ${props.index===v.key ? "active" : ""}`} to={v.link}>
                        <i className="nav-link-icon">{v.ico}</i><span className="nav-link-name">{v.text}</span>
                      </Link>
                    );
                  })
                }
              </div>
              <div className='nav-list' data-count={chCount}>
                {userElements}
              </div>
            </div>
          </nav>
        </aside>
        <div className='sidebar-content'>
          {props.children}
        </div>
      </main>
    }        
    </>
  );

}

export default Nav