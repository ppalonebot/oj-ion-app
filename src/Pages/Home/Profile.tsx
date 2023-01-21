import { useQuery } from "react-query";
import { User } from "../../Entity/User/User_model";
import React from 'react';
import { JsonRPC2, JsonRPCresult } from "../../lib/MyJsonRPC2";
import { API_URL } from "../../global";
import Avatar from "../../Components/Avatar";
import { Link } from "react-router-dom";
import LoadingBar from "../../Components/LoadingBar/LoadingBar";
import { MdEdit } from "react-icons/md";

type Props = {
  user:User;
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
}

const Profile: React.FC<Props> = (props) => {
  const [profileData, setProfileData] = React.useState<ProfileData>({} as ProfileData)
  const rpc = new JsonRPC2("GetMyProfile",{"uid":props.user.uid})
  const { isLoading, error, refetch } = useQuery(
    'GetMyProfile',
    () => fetch(API_URL+'/prf/rpc',
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
      refetchInterval: 30*60 * 1000,
      onError(err) {
        console.log("error")
        console.log(err)
      },
      onSuccess(data) {
        if (data){
          if (data.result){
            let u = (data as JsonRPCresult).result as ProfileData
            setProfileData(u)
          }
          else{
            console.log(data.error)
          }
        }  
      },
    }
  )

  return (
    <>
    <LoadingBar loading={isLoading} />
    <div className='mt-8 p-4 w-full h-full flex flex-col justify-start items-center'>
    {
      isLoading? <p className='text-center mt-10'>Loading...</p> :
      error? <p className='text-center mt-10'>Error:  {(error as { message: string }).message}</p> :
      <>
      <Link to={process.env.PUBLIC_URL+"/avatardetail"}>
        <Avatar className="w-48 h-48 rounded-full object-cover" src={API_URL+(profileData.avatar?profileData.avatar:"/image/404notfound")} alt={profileData.name}/>
      </Link >
      <div className="flex flex-col justify-center">
        <p className="mt-2 text-xl text-center"><span className='font-bold text-orange-400'>{profileData.name}</span></p>
        <p className='text-center'>{profileData.status}</p>
        <Link to={process.env.PUBLIC_URL+"/profileedit"} className="flex flex-row hover:text-blue-700 text-white font-bold py-2 px-4 gap-2 justify-center">
          <MdEdit size={22}/><span>Edit</span> 
        </Link >
      </div>
      
      <div className="mt-4 max-w-lg">
        <p className='mb-2'>Username: {profileData.username}</p>
        <p className='mb-2'>Email: {profileData.email}</p>
        <p className='mb-2'>Status: {profileData.status}</p>
        <p className='mb-2'>Bio: {profileData.bio}</p>
      
      </div>
      
      </>
    }
    </div>
    </>
  );
};

export default Profile;