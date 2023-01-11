import React from "react";
import { User } from "../../Entity/User/User_model";
import { API_URL } from "../../global";

type Props = React.PropsWithChildren<{ 
  user:User;
  isLoading:boolean;
  error:unknown,
}>;

const Nav: React.FC<Props> = (props) => {
  const [visibleAva, setVisibleAva] = React.useState(true);
  
  function handleError() {
    setVisibleAva(false);
  }

  return (
    <>
      {
          props.isLoading? <p className='text-center mt-10'>Loading...</p> :
          props.error? <p className='text-center mt-10'>Error:  {(props.error as { message: string }).message}</p> :
          <div className="m-2 flex align-center h-16">
            
            <div className="mr-4 my-auto">
              {visibleAva && <img className="h-12 w-12 rounded-full object-cover" src={API_URL+(props.user.avatar?props.user.avatar:"/image/404notfound")} alt="Avatar" onError={handleError}/>}
              {!visibleAva && <img className="h-12 w-12 rounded-full object-cover" src={process.env.PUBLIC_URL+'/default-avatar.jpg'} alt="Avatar"/>}
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