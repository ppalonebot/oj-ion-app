import * as React from 'react';
import { useMutation } from 'react-query';

interface Registration {
  usr: string;
  pwd: string;
  cpwd: string;
  email: string;
}

const UserRegister: React.FC = () => {
  // Use the `useState` hook to create state variables
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [email, setEmail] = React.useState('');
  const mutationResult  = useMutation(
    (reg : Registration) => fetch(process.env.PUBLIC_URL+'/api/register', {
      method: 'POST',
      body: JSON.stringify(reg),
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()),
    {
      onSuccess: (data,v ,ctx) => {
        // Do something after the mutation is successful, such as showing a success message or redirecting the user
        console.log(data)
      },
      onError: (error, v, ctx) => {
        // Do something after the mutation fails, such as showing an error message
        console.log(v)
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
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else if (name === 'email') {
      setEmail(value);
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Perform validation and submit the form
    const reg: Registration = {usr: username, pwd: password, cpwd: confirmPassword, email: email}
    registerUser(reg)
  }

  return (
    <div className='h-screen w-screen'>
      <div className='p-4 w-full h-full flex flex-col justify-start items-center'>
        <h1 className='text-3xl p-8'>New User Register</h1>
        <form onSubmit={handleSubmit} className="bg-gray-900 shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-lg w-full">
          <div className="mb-6">
            <label className="block text-gray-200 text-sm font-bold mb-2" htmlFor="username">
              username:
            </label>
            <input
              className="bg-slate-700 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-6">  
            <label className="block text-gray-200 text-sm font-bold mb-2" htmlFor="password">
              password:
            </label>
            <input
              className="bg-slate-700 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-200 text-sm font-bold mb-2" htmlFor="confirmPassword">
              confirm password:
            </label>
            <input
              className="bg-slate-700 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-200 text-sm font-bold mb-2" htmlFor="email">
              email:
            </label>
            <input
              className="bg-slate-700 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleInputChange}
            />
          </div>
            
          <div className='w-full flex justify-end'>
            <button disabled={status === 'loading'} type="submit" className="w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
          </div>
          
          
        </form>
      </div>
    </div>
  );
};

export default UserRegister;
