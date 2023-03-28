import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { User } from '../../Entity/User/User_model';
import { JsonRPC2 } from '../../lib/MyJsonRPC2';
import MyDialog, { DialogProps } from '../../Components/MyDialog';
import InputForm, { ErrInput } from '../../Components/InputForm/InputForm';
import { API_URL } from '../../global';
import { Link } from 'react-router-dom';

type Props = {
  usr: string;
  pwd: string;
};

interface ErrLogin {
  username?: string;
  password?: string;
}

const Login: React.FC<Props> = ({ usr, pwd }) => {
  const navigate = useNavigate()

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [errLogin, setErrLogin] = React.useState<ErrLogin>({})

  const [dialogProps, setDialogProps] = React.useState({title: "title", isDialogOpen: false, children: <p>#empty</p>} as DialogProps);
  const toggleDialog = () =>{
    setDialogProps({...dialogProps,isDialogOpen: !dialogProps.isDialogOpen});
  }

  const mutationResult  = useMutation(
    (rpc : JsonRPC2) => fetch(API_URL+'/usr/rpc', {
      method: 'POST',
      body: JSON.stringify(rpc),
      credentials: 'include', //must included
      headers: { 
        'Content-Type': 'application/json',
        'credentials': 'true' //must included
      }
    }).then(res => res.json()),
    {
      onSuccess: (data,v ,ctx) => {
        if (data.result !== null){
          let s = new User(data.result.uid, data.result.name, data.result.username,data.result.email,data.result.jwt,data.result.isregistered)
          s.save()

          setTimeout(function() {
            navigate('/');
          }, 300);
        }
        else{
          if (data.error.params){
            if (Array.isArray(data.error.params)){
              let er:{ [key: string]: string } = {}
              data.error.params.forEach((p : ErrInput) => {
                er[p.field] = p.error
              });
              setErrLogin(er as ErrLogin)
            }
          }
          else{
            setDialogProps({...dialogProps,isDialogOpen: true, title:"Error "+data.error.code, children:<p>{data.error.message}</p>});
          }
        }
      },
      onError: (error, v, ctx) => {
        // Do something after the mutation fails, such as showing an error message
        console.log(error)
        setDialogProps({...dialogProps,isDialogOpen: true, title:"Info",children:<p>Server Busy</p>});
      }
    }
  );
  const loginUser = mutationResult.mutate;
  const status = mutationResult.status;

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const name = target.name;

    // Use the `name` variable to determine which state variable to update
    if (name === 'username') {
      setUsername(value);
      if (errLogin.username) {
        setErrLogin({...errLogin, username: ""})
      }
    } else if (name === 'password') {
      setPassword(value);
      if (errLogin.password) {
        setErrLogin({...errLogin, password: ""})
      }
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let login: ErrLogin = {username: username, password: password} as ErrLogin
    let rpc : JsonRPC2 = new JsonRPC2("Login",login)
    loginUser(rpc)
  }

  

  return (
    <div className='min-w-[100vw] min-h-[100vh]'>
      <MyDialog title={dialogProps.title} isDialogOpen={dialogProps.isDialogOpen} toggleDialog={toggleDialog} >
        {dialogProps.children}
      </MyDialog>
      <div className='p-4 w-full h-full flex flex-col justify-start items-center'>
        
        <form onSubmit={handleSubmit} className="bg-esecondary-color shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-lg w-full bg-opacity-50">
          <p className='text-3xl p-4 mb-4 text-center'>Login</p>
          <InputForm name='username' type='text' label='Username' value={username} onChange={handleInputChange} errorMessage={errLogin.username? errLogin.username : ""} placeholder="Username or email"/>
          <InputForm name='password' type='password' label='Password' value={password} onChange={handleInputChange} errorMessage={errLogin.password? errLogin.password : ""} placeholder="Your password"/>
          <div className='w-full flex justify-end gap-2'>
          <Link to={process.env.PUBLIC_URL+"/resetpwd?email="+username} className="text-center w-1/2 hover:text-blue-700 text-white font-bold py-2 px-4 rounded">
            Forgot Password?
          </Link >
            <button disabled={status === 'loading'} type="submit" className="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
          </div>
        </form>
      </div>
    </div>
    
  );
};

export default Login