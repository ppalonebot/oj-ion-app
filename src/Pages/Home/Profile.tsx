import { useQuery } from "react-query";
import { User } from "../../Entity/User/User_model";
import React from 'react';
import { JsonRPC2, JsonRPCresult } from "../../lib/MyJsonRPC2";
import { API_URL } from "../../global";
import Avatar from "../../Components/Avatar";
import { Link, useNavigate } from "react-router-dom";
import LoadingBar from "../../Components/LoadingBar/LoadingBar";
import { MdEdit } from "react-icons/md";
import CttStatus from "../../Components/CttStatus";
import { Contact } from "../../Entity/User/Contact_model";

type Props = {
  user:User;
  setNavTitle?: (t:string) => void
}

export type ProfileData = {
  uid : string;
  name: string;
  username: string;
  email: string;
  isregistered: boolean;
  status : string;
  bio: string;
  ppic: string;
  avatar: string;
  contact:Contact;
}

const Profile: React.FC<Props> = (props) => {
  const navigate = useNavigate()

  const searchParams = new URLSearchParams(window.location.search);
  const [owner] = React.useState<string>(searchParams.get('usr')??"");

  const [profileData, setProfileData] = React.useState<ProfileData | null>(null)
  
  const rpc = owner ? new JsonRPC2("GetProfile",{"uid":props.user.uid, "username":owner}) : new JsonRPC2("GetMyProfile",{"uid":props.user.uid})
  const { isLoading, error, refetch } = useQuery(
    rpc.method,
    () => fetch(API_URL+'/prf/rpc',
    {
      method: 'POST',
      body: JSON.stringify(rpc),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()),
    {
      staleTime: 60 * 1000, // consider data stale after 60 seconds
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchIntervalInBackground: false,
      refetchInterval: 10*60 * 1000,
      cacheTime: 5 * 60 * 1000,
      onError(err) {
        console.log("error")
        console.log(err)
        navigate('/401',{ replace: true });
      },
      onSuccess(data) {
        if (data){
          if (data.result){
            let u = (data as JsonRPCresult).result as ProfileData
            setProfileData(u)
            if (props.setNavTitle) props.setNavTitle(u.name)
          }
          else{
            console.log(data.error)
            navigate('/404',{ replace: true });
          }
        }  
      },
    }
  )

  return (
    <>
    <LoadingBar loading={isLoading} />
    {
    profileData && <div className='mt-8 p-4 w-full h-full flex flex-col justify-start items-center'>
      {
        isLoading? <p className='text-center mt-10'>Loading...</p> :
        error? <p className='text-center mt-10'>Error:  {(error as { message: string }).message}</p> :
        <>

        {!owner && <Link to={process.env.PUBLIC_URL+"/avatardetail"}>
          <Avatar className="w-48 h-48 rounded-full object-cover" src={API_URL+(profileData.avatar?profileData.avatar:"/image/404notfound")} alt={profileData.name}/>
        </Link >}
        {owner && <Link to={process.env.PUBLIC_URL+"/imagedetail?img="+profileData.avatar.replace("/image/","")}>
          <Avatar className="w-48 h-48 rounded-full object-cover" src={API_URL+(profileData.avatar?profileData.avatar:"/image/404notfound")} alt={profileData.name}/>
        </Link >}

        <div className="flex flex-col justify-center">
          <p className="mt-2 text-xl text-center"><span className='font-bold text-orange-400'>{profileData.name}</span></p>
          <p className='text-center'>{profileData.status}</p>
          {!owner && <Link to={process.env.PUBLIC_URL+"/profileedit"} className="flex flex-row hover:text-blue-700 text-white font-bold py-2 px-4 gap-2 justify-center">
            <MdEdit size={22}/><span>Edit</span> 
          </Link >}
          {owner && <div>
            {(!profileData) && <span>Loading...</span>}
            {profileData && <CttStatus contact={profileData.contact} uid={props.user.uid} target={profileData.username}/>}
          </div>}
        </div>
        
        <div className="mt-4 max-w-lg">
          <p className='mb-2'>Username: {profileData.username}</p>
          {!owner && <p className='mb-2'>Email: {profileData.email}</p>}
          <p className='mb-2'>Status: {profileData.status}</p>
          <p className='mb-2'>Bio: {profileData.bio}</p>
        
        </div>
        
        </>
      }
      </div>
    }
    {
      !profileData && <div className='mt-8 p-4 w-full h-full flex flex-col justify-start items-center'> {isLoading? "Loading..." : "Not Found!"} </div>
    }
    </>
  );
};

export default Profile;