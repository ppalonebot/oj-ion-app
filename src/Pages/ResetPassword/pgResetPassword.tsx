import React from 'react';
import { useMutation } from 'react-query';
import { API_URL } from '../../global';
import { JsonRPC2 } from '../../lib/MyJsonRPC2';
import InputForm, { ErrInput } from '../../Components/InputForm/InputForm';
import MyDialog from '../../Components/MyDialog';
import Countdown from '../../Components/Countdown';
import { Link } from 'react-router-dom';

interface ErrResetPwd {
  email?: string;
}

function isEmail(email: string | null | undefined): boolean {
  if (email){
    // Check if the string is empty or has only one character
    if (email.length <= 2) {
      return false;
    }

    // Check if the string contains '@' but is not the first or last character
    return email.includes('@') && email.indexOf('@') !== 0 && email.indexOf('@') !== email.length - 1;
  }
  else{
    return false
  }
}

const ResetPassword: React.FC= () => {
  const searchParams = new URLSearchParams(window.location.search);
  const [email, setEmail] = React.useState<string>(isEmail(searchParams.get('email'))? searchParams.get('email')??"":"");

  const [err, setErr] = React.useState<ErrResetPwd>({})

  const [isForgotPwd, setForgotPwd] = React.useState(true);

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogMessage, setDialogMessage] = React.useState('Hello!');
  const [dialogTitle, setDialogTitle] = React.useState('A Title');
  const toggleDialog = () => {
    setIsDialogOpen(prevState => !prevState);
  }

  const mutationResult  = useMutation(
    (rpc : JsonRPC2) => fetch(API_URL+'/usr/rpc', {
      method: 'POST',
      body: JSON.stringify(rpc),
      headers: { 
        'Content-Type': 'application/json', 
      }
    }).then(res => {
      return res.json()
    }),
    {
      onSuccess: (data,v ,ctx) => {
        console.log(v)
        console.log(data)
        if (data.result !== null){
          setForgotPwd(false)
        }
        else{
          if (data.error.params){
            if (Array.isArray(data.error.params)){
              let er:{ [key: string]: string } = {}
              data.error.params.forEach((p : ErrInput) => {
                er[p.field] = p.error
              });
              setErr(er as ErrResetPwd)
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
        console.log(error)
        setIsDialogOpen(true)
        setDialogTitle("Info")
        setDialogMessage("Server Busy")
      }
    }
  );

  const resetPassword = mutationResult.mutate;
  const status = mutationResult.status;

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const name = target.name;

    // Use the `name` variable to determine which state variable to update
    if (name === 'email') {
      setEmail(value);
      if (err.email) {
        setErr({...err, email: ""})
      }
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.length === 0){
      setErr({...err, email: "email canr't empty"})
    }
    else{
      sendPwdReset()
    }
  }

  const sendPwdReset = () =>{
    let p: ErrResetPwd = {email: email} as ErrResetPwd
    let rpc : JsonRPC2 = new JsonRPC2("SendPwdReset",p)
    resetPassword(rpc)
  }

  return (
    <div className='min-w-[100vw] min-h-[100vh]'>
      <MyDialog title={dialogTitle} isDialogOpen={isDialogOpen} toggleDialog={toggleDialog} >
        <p>{dialogMessage}</p>
      </MyDialog>
     
      {
        !isForgotPwd? <div className='p-4 w-full h-full flex flex-col justify-start items-center'>
          <p>PLease check your email and follow the link to reset your password.</p>
          <Countdown onResend={sendPwdReset}/>
          <Link to={process.env.PUBLIC_URL+"/login"} className="mt-16 text-center w-60 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Login
          </Link >
          </div> :
      <div className='p-4 w-full h-full flex flex-col justify-start items-center'>
        <h1 className='text-3xl p-8'>Reset Password</h1>
        <form onSubmit={handleSubmit} className="bg-gray-900 shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-lg w-full">
          <InputForm name='email' type='email' label='Email' value={email??""} onChange={handleInputChange} errorMessage={err.email??""} placeholder="Email address to accept reset"/>
          <div className='w-full flex justify-end'>
            <button disabled={status === 'loading'} type="submit" className="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
          </div>
        </form>
      </div>
      }
    </div>
  );
};

export default ResetPassword