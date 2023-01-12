import React from "react";
import { User } from "../../../Entity/User/User_model";
import { API_URL } from "../../../global";
import Avatar from "../../../Components/Avatar";
import { Link } from "react-router-dom";

type Props = React.PropsWithChildren<{ 
  user:User;
  isLoading:boolean;
  error:unknown;
}>;

const Nav: React.FC<Props> = (props) => {
  return (
    <>
      {
          props.isLoading? <p className='text-center mt-10'>Loading...</p> :
          props.error? <p className='text-center mt-10'>Error:  {(props.error as { message: string }).message}</p> :
          <div className="m-2 flex align-center h-16">
            
            <div className="mr-4 my-auto">
              <Link to={process.env.PUBLIC_URL+"/profile"} >
                <Avatar className={"h-12 w-12 rounded-full object-cover"} src={API_URL+(props.user.avatar?props.user.avatar:"/image/404notfound")} alt={props.user.username}/>
              </Link>
            </div>
            <div className="my-auto">
              <p className="text-xl text-orange-400">{props.user.name}</p>
              <p>@{props.user.username}</p>
            </div>
            
          </div>
      }

          {props.children}
    </>
  );

}

export default Nav