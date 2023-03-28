import * as React from 'react';
import { useMutation } from 'react-query';
import {JsonRPC2} from '../../lib/MyJsonRPC2'
import InputForm, { ErrInput } from '../../Components/InputForm/InputForm';
import MyDialog from '../../Components/MyDialog';
import { User } from '../../Entity/User/User_model';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../global';

interface ErrRegister {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
}

const UserRegister: React.FC = () => {
  const navigate = useNavigate()

  const [name, setName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [email, setEmail] = React.useState('');

  const [errRegister, setErrRegister] = React.useState<ErrRegister>({})

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogMessage, setDialogMessage] = React.useState('Hello!');
  const [dialogTitle, setDialogTitle] = React.useState('A Title');

  const mutationResult  = useMutation(
    (rpc : JsonRPC2) => fetch(API_URL+'/usr/rpc', {//fetch(process.env.PUBLIC_URL+'/usr/rpc', {
      method: 'POST',
      body: JSON.stringify(rpc),
      credentials: 'include', //must included
      headers: { 
        'Content-Type': 'application/json', 
        'credentials': 'true' //must included
      }
    }).then(res => {
      return res.json()
    }),
    {
      onSuccess: (data,v ,ctx) => {
        console.log(v)
        // Do something after the mutation is successful, such as showing a success message or redirecting the user
        console.log(data)
        if (data.result !== null){
          let s = new User(data.result.uid, data.result.name, data.result.username,data.result.email,data.result.jwt,data.result.isregistered)
          s.save()
          // setUserSelf(s)
          setTimeout(function() {
            navigate(process.env.PUBLIC_URL+'/?c=50');
          }, 300);
        }
        else{
          if (data.error.params){
            if (Array.isArray(data.error.params)){
              let er:{ [key: string]: string } = {}
              data.error.params.forEach((p : ErrInput) => {
                er[p.field] = p.error
              });
              setErrRegister(er as ErrRegister)
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

  const registerUser = mutationResult.mutate;
  const status = mutationResult.status;

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const name = target.name;

    // Use the `name` variable to determine which state variable to update
    if (name === 'name') {
      setName(value);
      if (errRegister.name) {
        setErrRegister({...errRegister, name: ""})
      }
    } else if (name === 'username') {
      setUsername(value);
      if (errRegister.username) {
        setErrRegister({...errRegister, username: ""})
      }
    } else if (name === 'email') {
      setEmail(value);
      if (errRegister.email) {
        setErrRegister({...errRegister, email: ""})
      }
    } else if (name === 'password') {
      setPassword(value);
      if (errRegister.password) {
        setErrRegister({...errRegister, password: ""})
      }
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
      if (errRegister.password) {
        setErrRegister({...errRegister, password: ""})
      }
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Perform validation and submit the form
    if (password === confirmPassword){
      const r: ErrRegister = {name: name, username: username, email: email, password: password} as ErrRegister
      const rpc : JsonRPC2 = new JsonRPC2("Register",r)
      registerUser(rpc)
    }
    else{
      setErrRegister({password:"password didn't match"} as ErrRegister)
    }
  }

  const toggleDialog = () => {
    setIsDialogOpen(prevState => !prevState);
  }

  return (
    <div className='min-w-[100vw] min-h-[100vh]'>
      <MyDialog title={dialogTitle} isDialogOpen={isDialogOpen} toggleDialog={toggleDialog} >
        <p>{dialogMessage}</p>
      </MyDialog>
      <div className='p-4 w-full h-full flex flex-col justify-start items-center'>
        
        <form onSubmit={handleSubmit} className="bg-esecondary-color shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-lg w-full bg-opacity-50">
          <p className='text-3xl p-4 mb-4 text-center '>Register</p>
          <InputForm name='name' type='text' label='Your Name' value={name} onChange={handleInputChange} errorMessage={errRegister.name? errRegister.name : ""} placeholder="ex: Susan Lee"/>
          <InputForm name='username' type='text' label='Username' value={username} onChange={handleInputChange} errorMessage={errRegister.username? errRegister.username : ""} placeholder="Your unique username"/>
          <InputForm name='email' type='email' label='Email' value={email} onChange={handleInputChange} errorMessage={errRegister.email? errRegister.email : ""} placeholder="Your Email"/>
          <InputForm name='password' type='password' label='Password' value={password} onChange={handleInputChange} errorMessage={errRegister.password? errRegister.password : ""} placeholder="Your password (min 6 chars)"/>
          <InputForm name='confirmPassword' type='password' label='Confirm password' value={confirmPassword} onChange={handleInputChange} errorMessage="" placeholder='Confirm Password above'/>
                    
          <div className='w-full flex justify-end'>
            <button disabled={status === 'loading'} type="submit" className="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegister;
