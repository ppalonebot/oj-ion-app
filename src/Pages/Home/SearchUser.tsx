import React, { useState } from 'react';
import InputForm from '../../Components/InputForm/InputForm';
import MyDialog, {DialogProps} from '../../Components/MyDialog';
import { useMutation } from 'react-query';
import { JsonRPC2 } from '../../lib/MyJsonRPC2';
import { API_URL } from '../../global';
import { User } from '../../Entity/User/User_model';
import Avatar from '../../Components/Avatar';
import { MdSearch } from 'react-icons/md';
import CttStatus, { Contact } from '../../Components/CttStatus';

type Props = {
  user:User;
}

type UserResult = {
  name:string;
  username:string;
  avatar:string;
  contact:Contact|null;
}

const SearchUser: React.FC<Props> = (props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<UserResult[]>([]);
  const [searchErr, setSearchErr] = useState('');
  const [dialogProps, setDialogProps] = useState({title: "title", isDialogOpen: false, children: <p>#empty</p>} as DialogProps);
  const toggleDialog = () =>{
    setDialogProps({...dialogProps,isDialogOpen: !dialogProps.isDialogOpen});
  }

  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    let target = event.target as HTMLInputElement;
    if (target.name === 'search') {
      setSearchTerm(target.value);
    }
  }

  const mutationResult  = useMutation(
    (rpc : JsonRPC2) => fetch(API_URL+'/contacts/rpc', {
      method: 'POST',
      body: JSON.stringify(rpc),
      credentials: 'include', //must included
      headers: { 
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()),
    {
      onSuccess: (data,v ,ctx) => {
        console.log(data)
        if (data.result){
          const res: UserResult[] = data.result.map((ele: unknown)=>{
            let temp =  ele as UserResult
            // if (temp.contact && temp.contact instanceof Contact){
            //   temp.contact = temp.contact as Contact
            // }
            return temp
          })
          setSearchResult(res)
        }
        else{
          setDialogProps({...dialogProps,isDialogOpen: true, title:"Error "+data.error.code, children:<p>{data.error.message}</p>})
        }
      },
      onError: (error, v, ctx) => {
        // Do something after the mutation fails, such as showing an error message
        console.log(error)
        setDialogProps({...dialogProps,isDialogOpen: true, title:"Info",children:<p>Server Busy</p>});
      }
    }
  );

  const search = mutationResult.mutate;
  const status = mutationResult.status;
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // perform API call with searchTerm here
    if (searchTerm === ""){
      setDialogProps({...dialogProps, isDialogOpen: true, children:<p>Please enter a name or @username</p>, title:"Info"})
      return
    } 

    if (!props.user){
      console.log("no user!")
      return
    }
    
    let rpc = new JsonRPC2("SearchUser", {uid: props.user.uid, keyword: searchTerm, page : "1", limit: "10"} )
    search(rpc)

  };

  return (
    <div className='bg-esecondary-color m-2 p-2 lg:p-6 rounded-lg'>
      <MyDialog title={dialogProps.title} isDialogOpen={dialogProps.isDialogOpen} toggleDialog={toggleDialog} >
        {dialogProps.children}
      </MyDialog>
      <form onSubmit={handleSubmit} className=" flex gap-2 max-w-lg mx-auto">
        <div className='w-4/5'>
          <InputForm
            type="text" 
            name="search" 
            placeholder="Enter a name or @username"
            label='Search for users'
            errorMessage={searchErr}
            onChange={handleChange}
            value={searchTerm}
          />
        </div>
        
        <button 
          type="submit" 
          className="w-1/5 bg-blue-500 text-white rounded py-2 px-4 hover:bg-blue-700 h-10 mt-7"
          disabled={status === 'loading'}
        >
          <span className='hidden sm:block'>Search</span>
          <i className='sm:hidden flex justify-center'><MdSearch size={24}/></i>
        </button>
      </form>
      <div className='flex flex-wrap gap-4 justify-between'>
      {
        searchResult && searchResult.map((o, index) => (
          o && <div key={o.username} className='flex flex-row gap-2 flex-1 min-w-[232px] justify-between border-r-2 border-gray-700'>
            <Avatar className='h-14 w-14 rounded-full object-cover' src={API_URL+(o.avatar?o.avatar:"/image/404notfound")} alt={o.username}/>
            <div className='my-auto flex-1'>
              <div className=''>
                <p>{o.name}</p>
                <p>@{o.username}</p>
              </div>
              
            </div>
          {
            o.contact == null && <div className='flex w-20 mr-1'>
              <CttStatus contact={o.contact} uid={props.user.uid} target={o.username}/>
            </div>
          }
          </div>
        ))
      }
      </div>
    </div>
    
  );
};

export default SearchUser;
