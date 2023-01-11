import { useQuery } from "react-query";
import { User } from "../../Entity/User/User_model";
import React from 'react';
import { JsonRPC2, JsonRPCresult } from "../../lib/MyJsonRPC2";
import { API_URL } from "../../global";

type Props = {
  user:User;
}

type ProfileData = {
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
    <div className='mt-8 p-4 w-full h-full flex flex-col justify-start items-center'>
    {
      isLoading? <p className='text-center mt-10'>Loading...</p> :
      error? <p className='text-center mt-10'>Error:  {(error as { message: string }).message}</p> :
      <>
      <p className='text-center'>Welcome {profileData.name}</p>
      <p className='text-center'>Your Email is {profileData.email}</p>
      </>
    }
    </div>
  );
};

export default Profile;