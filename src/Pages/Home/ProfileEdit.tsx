import * as React from 'react';
import { useMutation } from 'react-query';
import {JsonRPC2} from '../../lib/MyJsonRPC2'
import InputForm, { ErrInput } from '../../Components/InputForm/InputForm';
import MyDialog from '../../Components/MyDialog';
import { User } from '../../Entity/User/User_model';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../global';
import { ProfileData } from './Profile';
import TextAreaForm from '../../Components/TextAreaForm/TextAreaForm';

type Props = {
  user:User;
  mainRefresh: ()=>void;
}

const ProfileEdit: React.FC<Props> = (props) => {
  const navigate = useNavigate()

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogMessage, setDialogMessage] = React.useState('Hello!');
  const [dialogTitle, setDialogTitle] = React.useState('A Title');

  const [profileData, setProfileData] = React.useState<ProfileData | null>(null)
  const [errprofile, setErrprofile] = React.useState<ProfileData>({} as ProfileData)

  const profileMutation  = useMutation(
    () => fetch(API_URL+'/prf/rpc', {
      method: 'POST',
      body: JSON.stringify(new JsonRPC2("GetMyProfile",{"uid":props.user.uid})),
      credentials: 'include', //must included
      headers: { 
        'Content-Type': 'application/json'
      }
    }).then(res => {
      return res.json()
    }),
    {
      onSuccess: (data,v ,ctx) => {
        if (data.result !== null){
          setProfileData(data.result as ProfileData)
        }
        else{
          setIsDialogOpen(true)
          setDialogTitle("Error "+data.error.code)
          setDialogMessage(data.error.message)
        }
      },
      onError: (error, v, ctx) => {
        // Do something after the mutation fails, such as showing an error message
        console.log(error)
        setIsDialogOpen(true)
        setDialogTitle("Info")
        setDialogMessage("Server Busy")
      }
    }
  );

  const updateProfileMutt = useMutation(
    (rpc: JsonRPC2) => fetch(API_URL+'/prf/rpc', {
      method: 'POST',
      body: JSON.stringify(rpc),
      credentials: 'include', //must included
      headers: { 
        'Content-Type': 'application/json'
      }
    }).then(res => {
      return res.json()
    }),
    {
      onSuccess: (data,v ,ctx) => {
        if (data.result !== null){
          setTimeout(function() {
            navigate(process.env.PUBLIC_URL+'/profile');
          }, 300);
        }
        else{
          if (data.error.params){
            if (Array.isArray(data.error.params)){
              let er:{ [key: string]: string } = {}
              data.error.params.forEach((p : ErrInput) => {
                er[p.field] = p.error
              });
              setErrprofile(er as unknown as ProfileData)
            }
          }
          else{
            setIsDialogOpen(true)
            setDialogTitle("Error "+data.error.code)
            setDialogMessage(data.error.message)
          }
        }
      },
      onError: (error, v, ctx) => {
        // Do something after the mutation fails, such as showing an error message
        console.log(error)
        setIsDialogOpen(true)
        setDialogTitle("Info")
        setDialogMessage("Server Busy")
      }
    }
  );

  const getProfile = profileMutation.mutate;
  const status = updateProfileMutt.status;

  React.useEffect(()=>{
    if (profileData == null) getProfile()
  },[])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    const name = event.target.name;

    // Use the `name` variable to determine which state variable to update
    if (name === 'name') {
      if (value !== profileData?.name) {
        setProfileData({...profileData!, name: value})
      }
      if (errprofile.name) {
        setErrprofile({...errprofile, name: ""})
      }
    } else if (name === 'username') {
      if (value !== profileData?.username) {
        setProfileData({...profileData!, username: value})
      }
      if (errprofile.username) {
        setErrprofile({...errprofile, username: ""})
      }
    } else if (name === 'email') {
      if (value !== profileData?.email) {
        setProfileData({...profileData!, email: value})
      }
      if (errprofile.email) {
        setErrprofile({...errprofile, email: ""})
      }
    } else if (name === 'status') {
      if (value !== profileData?.status) {
        setProfileData({...profileData!, status: value})
      }
      if (errprofile.status) {
        setErrprofile({...errprofile, status: ""})
      }
    } else if (name === 'bio') {
      if (value !== profileData?.bio) {
        setProfileData({...profileData!, bio: value})
      }
      if (errprofile.bio) {
        setErrprofile({...errprofile, bio: ""})
      }
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Perform validation and submit the form
    const rpc : JsonRPC2 = new JsonRPC2("UpdateMyProfile",profileData)
    updateProfileMutt.mutate(rpc)
  }

  const toggleDialog = () => {
    setIsDialogOpen(prevState => !prevState);
  }

  return (
    <>
      <MyDialog title={dialogTitle} isDialogOpen={isDialogOpen} toggleDialog={toggleDialog} >
        <p>{dialogMessage}</p>
      </MyDialog>      
      <div className='p-4 w-full h-full flex flex-col justify-start items-center'>
        <h1 className='text-3xl p-8'>Edit Profile</h1>
        {profileData == null && <p>Loading...</p>}
        {
        profileData != null && 
        <form onSubmit={handleSubmit} className="bg-gray-900 shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-lg w-full">
          <InputForm name='name' type='text' label='Your Name' value={profileData.name} onChange={handleInputChange} errorMessage={errprofile.name? errprofile.name : ""} placeholder="ex: Susan Lee"/>
          <InputForm name='username' type='text' label='Username' value={profileData.username} onChange={handleInputChange} errorMessage={errprofile.username? errprofile.username : ""} placeholder="Your unique username"/>
          <InputForm name='email' type='email' label='Email' value={profileData.email} onChange={handleInputChange} errorMessage={errprofile.email? errprofile.email : ""} placeholder="Your Email"/>
          <InputForm name='status' type='text' label='Status' value={profileData.status} onChange={handleInputChange} errorMessage={errprofile.status? errprofile.status : ""} placeholder="Status"/>
          <TextAreaForm name='bio' label='Bio' value={profileData.bio} onChange={handleInputChange} errorMessage={errprofile.bio? errprofile.bio : ""} placeholder="Bio data"/>
                   
          <div className='w-full flex justify-end'>
            <button disabled={status === 'loading'} type="submit" className="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
          </div>
        </form>
        }
      </div>
      
    </>
  );
};

export default ProfileEdit;
