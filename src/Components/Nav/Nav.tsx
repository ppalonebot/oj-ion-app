import React from "react";
import { User } from "../../Entity/User/User_model";
import Avatar from "../Avatar";
import { Link } from "react-router-dom";
import './style.css';
import {  MdMenu, MdClose, MdAccessTimeFilled, MdPeopleAlt} from 'react-icons/md';
import MyMenu from "../MyMenu";
import { API_URL } from "../../global";

type Props = React.PropsWithChildren<{ 
  user: User;
  isLoading: boolean;
  error: unknown;
  index:number;
  title:string;
  logout: () => void
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
      text:'Search User',
      link:process.env.PUBLIC_URL+"/searchuser",
      ico:<MdPeopleAlt/>
    },
  ]

  return (
    <>
    <main className={show ? 'space-toggle' : ''}>
      <header className={`header ${show ? 'space-toggle' : ''}`}>
        <div className="header-toggle flex gap-4" onClick={() => setShow(!show)}>
          <div className="icon hover:text-elight-font-color ml-2">{show ? <MdClose /> : <MdMenu />}</div>
          <span className='text-esecondary-color font-semibold'>{props.title} </span>
        </div>
        <div >
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