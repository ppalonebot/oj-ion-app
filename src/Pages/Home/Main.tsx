import { useQuery } from "react-query";
import { User } from "../../Entity/User/User_model";
import React from 'react';
import { JsonRPC2, JsonRPCresult } from "../../lib/MyJsonRPC2";

type Props = {
  user:User;
}

const Main: React.FC<Props> = (props) => {
  const [userself, setUserself] = React.useState<User>(props.user)
  const rpc: JsonRPC2 = new JsonRPC2("GetSelf",{"uid":userself.uid})
  const { data , isLoading, error, refetch } = useQuery(
    'GetSelf',
    () => fetch('http://localhost:7000/usr/rpc',
    {
      method: 'POST',
      body: JSON.stringify(rpc),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()),
    {
      staleTime: 30 * 1000, // consider data stale after 30 seconds
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      refetchInterval: 60 * 1000
    }
  )

  React.useEffect(() => {
    if (data){
      console.log(data)
      setUserself((data as JsonRPCresult).result as User)
    }  
  }, [data])

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

  function handleRefreshClick() {
    refetch()
  }

  return (
    <div className='p-4 w-full h-full flex flex-col justify-start items-center'>
      <button onClick={handleRefreshClick}>Refresh</button>
    {
      isLoading? <p className='text-center mt-10'>Loading...</p> :
      error? <p className='text-center mt-10'>Error:  {(error as { message: string }).message}</p> :
      <p className='text-center mt-10'>Welcome {userself.name}</p>
    }
      
      <div className="mt-4 w-full flex justify-center">
        <button
          type="button"
          className="text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Main;