import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { User } from '../../Entity/User/User_model';
import { JsonRPC2 } from '../../lib/MyJsonRPC2';
import MyDialog from '../../Components/MyDialog';
import InputForm from '../../Components/InputForm/InputForm';

type Props = {
  usr: string;
  pwd: string;
};

interface ErrLogin {
  username?: string;
  password?: string;
}

interface ErrInput {
  field: string;
  error:string
}

const Login: React.FC<Props> = ({ usr, pwd }) => {
  const navigate = useNavigate()

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [errLogin, setErrLogin] = React.useState<ErrLogin>({})

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogMessage, setDialogMessage] = React.useState('Hello!');
  const [dialogTitle, setDialogTitle] = React.useState('A Title');

  const mutationResult  = useMutation(
    (rpc : JsonRPC2) => fetch('http://localhost:7000/usr/rpc', {
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
        console.log(v)
        // Do something after the mutation is successful, such as showing a success message or redirecting the user
        console.log(data)
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
    const login: ErrLogin = {username: username, password: password} as ErrLogin
    const rpc : JsonRPC2 = new JsonRPC2("Login",login)
    loginUser(rpc)
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
        <h1 className='text-3xl p-8'>New User Register</h1>
        <form onSubmit={handleSubmit} className="bg-gray-900 shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-lg w-full">
          <InputForm name='username' type='text' label='Username' value={username} onChange={handleInputChange} errorMessage={errLogin.username? errLogin.username : ""} placeholder="Username or email"/>
          <InputForm name='password' type='password' label='Password' value={password} onChange={handleInputChange} errorMessage={errLogin.password? errLogin.password : ""} placeholder="Your password"/>
          <div className='w-full flex justify-end'>
            <button disabled={status === 'loading'} type="submit" className="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login