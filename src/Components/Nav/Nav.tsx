import React from "react";
import { User } from "../../Entity/User/User_model";
import Avatar from "../Avatar";
import { Link } from "react-router-dom";
import './style.css';
import {  MdMenu, MdClose, MdAccessTimeFilled, MdPeopleAlt, MdLens} from 'react-icons/md';
import MyMenu from "../MyMenu";
import { API_URL } from "../../global";
import { ContactDict } from "../../Pages/Home/Main";

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

  const pages : Array<MainLink> = [
    {
      key:0,
      text:'Home',
      link:process.env.PUBLIC_URL+"/",
      ico:<MdAccessTimeFilled/>
    },
    {
      key:1,
      text:'Contact List',
      link:process.env.PUBLIC_URL+"/searchuser",
      ico:<MdPeopleAlt/>
    },
  ]

  const getParam = (key:string) =>{
    return new URLSearchParams(window.location.search).get(key)??""
  }

  const userElements = [];
  const sortedUsers = [];
  for (const key in props.target) {
    if (props.target.hasOwnProperty(key)) {
      sortedUsers.push(props.target[key]);
    }
  }
  sortedUsers.sort((a, b) => (a.datas.updated < b.datas.updated) ? 1 : -1);
  sortedUsers.sort((a, b) => (a.datas.wsStatus === 'online' ? -1 : 1));

  for (const user of sortedUsers) {
    userElements.push(
      <Link key={user.username} className={`nav-link ${getParam('usr') === user.username && window.location.pathname === '/message' ? "active" : ""}`} to={process.env.PUBLIC_URL+"/message?usr="+user.username}>
        <i className="nav-link-icon">
          <Avatar className={"h-10 w-10 rounded-full object-cover"} src={API_URL+(user.avatar?user.avatar:"/image/404notfound")} alt={user.username}/>
          {user.datas.wsStatus === "online" && <p className={`absolute text-green-400 bottom-1 left-9 ${!show?"":"md:hidden"}`}><MdLens size={14}/></p>}
        </i>
        <span className="nav-link-name">{user.name}</span>
        {show && user.datas.wsStatus === "online" && <span className="absolute text-green-400 rounded-full right-2 h-8 w-8 flex justify-center items-center bg-esecondary-color bg-opacity-80"><MdLens size={14}/></span>}
      </Link>
    );
  }

  return (
    <>
    <main className={show ? 'space-toggle' : ''}>
      <header className={`header ${show ? 'space-toggle' : ''}`}>
        <div className="flex gap-4 max-h-full" >
          <div onClick={() => setShow(!show)} className="header-toggle icon hover:text-elight-font-color ml-2 flex items-center">{show ? <MdClose /> : <MdMenu />}</div>
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
          <MyMenu logout={props.logout}/>
        </div>
      </header>
      <aside className={`sidebar ${show ? 'show' : ''}`}>
        <nav className='nav'>
          <div>
            
          {
            props.isLoading? <p>Loading...</p> :
            props.error? <p>Error:  {(props.error as { message: string }).message}</p> :
            
            <Link to={process.env.PUBLIC_URL+"/profile"} className="nav-logo">
              <i className="nav-logo-icon">
                <Avatar className={"h-10 w-10 rounded-full object-cover"} src={API_URL+(props.user.avatar?props.user.avatar:"/image/404notfound")} alt={props.user.username}/>
              </i>
              <span className="nav-logo-name">{props.user.name}</span>
            </Link>
          }
          
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
            <div className='nav-list'>
              {userElements}
            </div>
          </div>
        </nav>
      </aside>
      <div className='sidebar-content'>
        {props.children}
      </div>
    </main>        
    </>
  );

}

export default Nav