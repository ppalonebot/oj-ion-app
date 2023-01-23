import { useQuery } from "react-query";
import { User } from "../../Entity/User/User_model";
import React from 'react';
import { JsonRPC2, JsonRPCresult } from "../../lib/MyJsonRPC2";
import { API_URL } from "../../global";
import { Link } from "react-router-dom";
import Profile from "./Profile";
import Nav from "./Nav/Nav";
import AvatarDetail from "./AvatarDetail";
import ProfileEdit from "./ProfileEdit";
import SearchUser from "./SearchUser";
import ImageDetail from "./ImageDetail";

type Props = {
  user:User
  page?:string
}

const Main: React.FC<Props> = (props) => {
  const [navTitle,setNavTitle] = React.useState<string>("Home")
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
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={-2} title={navTitle}>
          <Profile key={"profile"} user={userself} setNavTitle={setNavTitle}/>
        </Nav>);
    case 'myprofile':
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={-1} title={navTitle}>
          <Profile key={"myprofile"} user={userself} setNavTitle={setNavTitle}/>
        </Nav>);
    case 'profileedit':
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={-1} title={navTitle}>
          <ProfileEdit user={userself} mainRefresh={refetch} setNavTitle={setNavTitle}/>;
        </Nav>);
    case 'avatardetail':
      return <AvatarDetail isLoading={isLoading} error={error} user={userself} mainRefresh={refetch}/>
    case 'imagedetail':
      return <ImageDetail />
    case 'searchuser':
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={1} title={navTitle}>
          <SearchUser user={userself} setNavTitle={setNavTitle}/>
        </Nav>)
    default:
      setTimeout(()=>setNavTitle("Home"),100)
      return (
        <Nav isLoading={isLoading} error={error} user={userself} logout={logout} index={0} title={navTitle}>
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
        </Nav>
      );
  }
};

export default Main;