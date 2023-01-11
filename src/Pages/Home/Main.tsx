import { useQuery } from "react-query";
import { User } from "../../Entity/User/User_model";
import React from 'react';
import { JsonRPC2, JsonRPCresult } from "../../lib/MyJsonRPC2";
import { API_URL } from "../../global";
import { Link } from "react-router-dom";
import Profile from "./Profile";
import Nav from "./Nav";

type Props = {
  user:User;
  page?:string
}

const Main: React.FC<Props> = (props) => {
  const [userself, setUserself] = React.useState<User>(props.user)
  const [rpc, setRpc] = React.useState<JsonRPC2>(new JsonRPC2("GetSelf",{"uid":userself.uid}))
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
      staleTime: 60 * 1000, // consider data stale after 30 seconds
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      refetchInterval: 5*60 * 1000,
      onError(err) {
        console.log("error")
        console.log(err)
        logout()
      },
      onSuccess(data) {
        console.log(data)
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

  switch (props.page) {
    case 'profile':
      return <Nav isLoading={isLoading} error={error} user={userself} ><Profile user={userself}/></Nav>
    case 'about':
      return <div>This is the about page</div>;
    case 'contact':
      return <div>This is the contact page</div>;
    default:
      return (
        <Nav isLoading={isLoading} error={error} user={userself} >
          <div className='p-4 w-full h-full flex flex-col justify-start items-center'>
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
        </Nav>
      );
  }
};

export default Main;