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
import { useNavigate } from 'react-router-dom';
import Pagination, { Paging } from '../../Components/Pagination';
import LoadingBar from '../../Components/LoadingBar/LoadingBar';

type Props = {
  user:User;
}

type UserResult = {
  name:string;
  username:string;
  avatar:string;
  contact:Contact|null;
}

const Contacts: React.FC<Props> = (props) => {
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(window.location.search);
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('k')??"");
  const [lastSearchTerm, setLastSearchTerm] = useState<string>("");
  const [searchResult, setSearchResult] = useState<UserResult[]>([]);
  const [paging, setPaging] = useState<Paging>({
    next:false,
    prev:false,
    page:parseInt(searchParams.get('p') ?? "1") ?? 1,
    limit:10})
  const [searchErr, setSearchErr] = useState('');
  const [status, setStatus] = useState('idle');
  const [dialogProps, setDialogProps] = useState({title: "title", isDialogOpen: false, children: <p>#empty</p>} as DialogProps);
  const toggleDialog = () =>{
    setDialogProps({...dialogProps,isDialogOpen: !dialogProps.isDialogOpen});
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
          setStatus("success")
          const res: UserResult[] = data.result.map((ele: unknown)=>{
            let temp =  ele as UserResult
            return temp
          })
          
          let urlparams = new URLSearchParams(window.location.search)
          let page = urlparams.get('p') ?? "1"
          let p = parseInt(page) ?? 1;

          setPaging({...paging,
            next: res.length === paging.limit,
            prev: p > 1,
            page: p,
          });

          setSearchResult(res)
        }
        else{
          setStatus("error")
          setSearchErr(data.error.message)
          //setDialogProps({...dialogProps,isDialogOpen: true, title:"Error "+data.error.code, children:<p>{data.error.message}</p>})
        }
      },
      onError: (error, v, ctx) => {
        // Do something after the mutation fails, such as showing an error message
        console.log(error)
        setStatus("error")
        setDialogProps({...dialogProps,isDialogOpen: true, title:"Info",children:<p>Server Busy</p>});
      }
    }
  );

  const search = mutationResult.mutate;
  //const status = mutationResult.status;

  const doSearching = (k:string, page: string) => {
    if (k === ""){
      setDialogProps({...dialogProps, isDialogOpen: true, children:<p>Please enter a name or @username</p>, title:"Info"})
      return
    } 
  
    setStatus('loading')
    let rpc = new JsonRPC2("SearchUser", {uid: props.user.uid, keyword: k, page : page, limit: ""+paging.limit} )
    setLastSearchTerm(k)
    search(rpc)
  }

  const nextSearching = () => {
    let nextPage = paging.page + 1
    setPaging({...paging,page : nextPage})
    setSearchTerm(lastSearchTerm)
    navigate('/contacts?k='+lastSearchTerm+"&p="+nextPage);
    doSearching(lastSearchTerm,nextPage+"")
  }

  const prevSearching = () => {
    let prevPage = paging.page - 1
    prevPage = prevPage <= 0? 1:prevPage
    setPaging({...paging,page : prevPage})
    setSearchTerm(lastSearchTerm)
    navigate('/contacts?k='+lastSearchTerm+"&p="+prevPage);
    doSearching(lastSearchTerm,prevPage+"")
  }
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // perform API call with searchTerm here
    let k = searchTerm.trim()
    navigate('/contacts?k='+k);
    setPaging({...paging,page:1})
    doSearching(k,"1")
    setSearchTerm(k)
    if (searchErr !== "") setSearchErr("")
  };

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    let target = event.target as HTMLInputElement;
    if (target.name === 'search') {
      setSearchTerm(target.value);
      if (searchErr !== "") setSearchErr("")
    }
  }

  const handleSearchChange = () => {
    let urlparams = new URLSearchParams(window.location.search)
    let k = urlparams.get('k') ?? "";
    let page = urlparams.get('p') ?? "1"
    setSearchTerm(k)
    let p = parseInt(page) ?? 1;
    setPaging({...paging,page:p})

    doSearching(k, page)
  }

  const hasMountedRef = React.useRef(false);
  React.useEffect(()=>{
    window.addEventListener('popstate', handleSearchChange);

    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    if (searchTerm !== ""){
      // perform API call with searchTerm here
      doSearching(searchTerm, paging.page+"")
    }

    return () => {
      window.removeEventListener('popstate', handleSearchChange);
    };
  },[])

  return (
  <>
    <LoadingBar loading={status==='loading'} />
    <div className='sm:bg-esecondary-color m-2 py-6 px-2 lg:px-6 rounded-lg'>
      <MyDialog title={dialogProps.title} isDialogOpen={dialogProps.isDialogOpen} toggleDialog={toggleDialog} >
        {dialogProps.children}
      </MyDialog>
      
      <form onSubmit={handleSubmit} className=" flex gap-2 max-w-lg mx-auto">
        <div className='w-4/5'>
          <InputForm
            type="text" 
            name="search" 
            placeholder="Enter a name or @username"
            label='Search for user'
            errorMessage={searchErr}
            onChange={handleInputChange}
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
      <div className='flex flex-wrap gap-4 justify-center'>
      {
        searchResult && searchResult.map((o, index) => (
          o && <div key={o.username} className='flex flex-row gap-2 flex-1 min-w-[260px] max-w-lg justify-between border-l-2 px-1 sm:px-2 border-gray-700'>
            <Avatar className='h-14 w-14 rounded-full object-cover my-auto' src={API_URL+(o.avatar?o.avatar:"/image/404notfound")} alt={o.username}/>
            <div className='my-auto flex-1 overflow-hidden'>
              <div className=''>
                <p>{o.name}</p>
                <p>@{o.username}</p>
              </div>
              
            </div>
            <div className='flex w-20'>
              <CttStatus contact={o.contact} uid={props.user.uid} target={o.username}/>
            </div>
          </div>
        ))
      }
      {
        (searchResult.length === 0 && lastSearchTerm !== "" ) &&<p>{status==='loading' ? "Loading..." : "No result!"}</p>
      }
      </div>
      {
        ((searchResult.length > 0 || paging.page > 1 || status==='loading') && (lastSearchTerm !== "" || status==='loading')) && 
        <Pagination {...paging} 
          nextBtn={nextSearching} 
          prevBtn={prevSearching} 
          loading={status==='loading'}
        />
      }
    </div>
  </>
  );
};

export default Contacts;
