import React, { useState } from 'react';
import InputForm from '../../Components/InputForm/InputForm';
import MyDialog, {DialogProps} from '../../Components/MyDialog';
import { useMutation } from 'react-query';
import { JsonRPC2 } from '../../lib/MyJsonRPC2';
import { API_URL, UserCountResult } from '../../global';
import { User } from '../../Entity/User/User_model';
import Avatar from '../../Components/Avatar';
import { MdSearch } from 'react-icons/md';
import CttStatus from '../../Components/CttStatus';
import { useNavigate } from 'react-router-dom';
import Pagination, { Paging } from '../../Components/Pagination';
import LoadingBar from '../../Components/LoadingBar/LoadingBar';
import { Link } from 'react-router-dom';
import { STATUS } from '../../Entity/Enum';
import { UserResult } from '../../Entity/User/Contact_model';
import { myContext } from '../../lib/Context';

type Props = {
  user:User;
  setNavTitle?: (t:string) => void
}

const SearchUser: React.FC<Props> = (props) => {
  const ctx = React.useContext(myContext);
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(window.location.search);
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('k')??"");
  const [lastSearchTerm, setLastSearchTerm] = useState<string>("");
  const initPage = isNaN(parseInt(searchParams.get('p') ?? "1")) ? 1 : parseInt(searchParams.get('p') ?? "1");
  
  const hasNextPage = ctx.Friends[initPage + 1]?.length > 0;
  const hasEnoughResults = ctx.Friends[initPage]?.length >= UserCountResult;
  const flag = (!hasNextPage && hasEnoughResults) || hasNextPage || hasEnoughResults;
  const [paging, setPaging] = useState<Paging>({
    next:flag,//((!ctx.Friends[initPage + 1] && ctx.Friends[initPage] && ctx.Friends[initPage].length >= UserCountResult) || (ctx.Friends[initPage + 1] && ctx.Friends[initPage + 1].length > 0)) || (ctx.Friends[initPage] && ctx.Friends[initPage].length >= UserCountResult),
    prev:initPage > 1,
    page:initPage,
    limit:UserCountResult})
  const [searchErr, setSearchErr] = useState('');
  const [status, setStatus] = useState('idle');
  const [searchResult, setSearchResult] = useState<UserResult[]>(ctx.Friends[initPage] && searchTerm === "" ?ctx.Friends[initPage] : []);
  const deltaWaitSec = 5*60
  const deltaSec = ctx.FriendPageLastUpdate[initPage] ? (new Date().getTime() - ctx.FriendPageLastUpdate[initPage].getTime()) / 1000 : deltaWaitSec;
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
      onSuccess: (data,v ,c) => {
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
          
          if (searchTerm === ""){
            ctx.Friends[p] = res
            ctx.FriendPageLastUpdate[p] = new Date()
          }
        }
        else{
          setStatus("error")
          setSearchErr(data.error.message)
          //setDialogProps({...dialogProps,isDialogOpen: true, title:"Error "+data.error.code, children:<p>{data.error.message}</p>})
        }
      },
      onError: (error, v, c) => {
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
    if (!(deltaSec >= deltaWaitSec || k !== "") ) return
    setStatus('loading')
    let rpc = new JsonRPC2("SearchUser", {uid: props.user.uid, keyword: k, page : page, limit: ""+paging.limit, status:k?"":STATUS.Accepted} )
    setLastSearchTerm(k)
    search(rpc)
  }

  const nextSearching = () => {
    let nextPage = paging.page + 1
    setPaging({...paging,page : nextPage})
    setSearchTerm(lastSearchTerm)
    navigate('/searchuser?k='+lastSearchTerm+"&p="+nextPage);
    doSearching(lastSearchTerm,nextPage+"")
  }

  const prevSearching = () => {
    let prevPage = paging.page - 1
    prevPage = prevPage <= 0? 1:prevPage
    setPaging({...paging,page : prevPage})
    setSearchTerm(lastSearchTerm)
    navigate('/searchuser?k='+lastSearchTerm+"&p="+prevPage);
    doSearching(lastSearchTerm,prevPage+"")
  }
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // perform API call with searchTerm here
    let k = searchTerm.trim()
    navigate('/searchuser?k='+k);
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

  const hasMountedRef = React.useRef(false);
  React.useEffect(()=>{
    if (hasMountedRef.current) return
    hasMountedRef.current = true;

    if (props.setNavTitle) props.setNavTitle("Contacts")
    doSearching(searchTerm, paging.page+"")

    return
  },[])

  return (
  <>
    <LoadingBar loading={status==='loading'} />
    <div className='bg-esecondary-color m-2 py-6 px-2 lg:px-6 rounded-lg bg-opacity-50'>
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
          o && <div key={o.username} className='flex flex-row flex-1 min-w-[260px] max-w-lg justify-between border-l-2 px-1 sm:px-2 border-gray-700'>
            <Link to={process.env.PUBLIC_URL+"/profile?usr="+o.username} className="my-auto">
              <Avatar className='h-14 w-14 rounded-full object-cover' src={API_URL+(o.avatar?o.avatar:"/image/404notfound")} alt={o.username}/>
            </Link>
            <div className='my-auto ml-2 flex-1 overflow-hidden'>
              <Link to={process.env.PUBLIC_URL+"/profile?usr="+o.username} className="hover:text-blue-400">
                <p>{o.name}</p>
                <p>@{o.username}</p>
              </Link>
              
            </div>
            <div className='flex w-20'>
              <CttStatus contact={o.contact} uid={props.user.uid} target={o.username}/>
            </div>
          </div>
        ))
      }
      {
        (searchResult.length %2 > 0) && <div className='flex-1 min-w-[260px] max-w-lg px-1 sm:px-2'></div>
      }
      {
        (searchResult.length === 0) &&<p>{status==='loading' ? "Loading..." : "No result!"}</p>
      }
      </div>
      {
        (searchResult.length > 0 || paging.page > 1 || status==='loading') && 
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

export default SearchUser;
