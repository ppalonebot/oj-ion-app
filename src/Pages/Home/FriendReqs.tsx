import React, {FC} from 'react';
import { User } from '../../Entity/User/User_model';
import { Contact } from '../../Entity/User/Contact_model';
import Pagination, { Paging } from '../../Components/Pagination';
import { API_URL, UserCountResult } from '../../global';
import { STATUS } from '../../Entity/Enum';
import { JsonRPC2, JsonRPCresult } from '../../lib/MyJsonRPC2';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../../Components/Avatar';
import CttStatus from '../../Components/CttStatus';
import { myContext } from '../../lib/Context';
import LoadingBar from '../../Components/LoadingBar/LoadingBar';


interface Props {
  user: User;
  setNavTitle?: (t:string) => void
}

type UserResult = {
  name:string;
  username:string;
  avatar:string;
  contact:Contact|null;
}

const FriendReqs: FC<Props> = (props) => {
  const ctx = React.useContext(myContext);
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const initPage = isNaN(parseInt(searchParams.get('p') ?? "1")) ? 1 : parseInt(searchParams.get('p') ?? "1");

  const hasNextPage = ctx.FriendReqs[initPage + 1]?.length > 0;
  const hasEnoughResults = ctx.FriendReqs[initPage]?.length >= UserCountResult;
  const flag = (!hasNextPage && hasEnoughResults) || hasNextPage || hasEnoughResults;
  const [paging, setPaging] = React.useState<Paging>({
    next:flag,
    prev:initPage > 1,
    page:initPage,
    limit:UserCountResult});
  const [statuss, setStatus] = React.useState('idle');
  const [rpc, setRpc] = React.useState( new JsonRPC2("SearchUser", {
    uid: props.user.uid, 
    keyword: "", 
    page : paging.page+"", 
    limit: ""+paging.limit, 
    status:STATUS.Pending} ) )
  const deltaWaitSec = 5*60
  const deltaSec = ctx.FriendReqsLastUpdate[initPage] ? (new Date().getTime() - ctx.FriendReqsLastUpdate[initPage].getTime()) / 1000 : deltaWaitSec;
  const [userReqs, setUserReqs] = React.useState<UserResult[]>(ctx.FriendReqs[initPage] && !(deltaSec >= deltaWaitSec)? ctx.FriendReqs[initPage]:[])
  const { status, refetch } = useQuery(
    "FriendRequest",
    () => fetch(API_URL+'/contacts/rpc',
    {
      method: 'POST',
      body: JSON.stringify(rpc),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()),
    {
      staleTime: 60 * 1000, // consider data stale after 60 seconds
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchIntervalInBackground: false,
      refetchInterval: deltaWaitSec * 1000,
      cacheTime: deltaWaitSec * 1000,
      enabled: true,//deltaSec >= deltaWaitSec,
      onError(err) {
        setStatus("error")
        console.log("error")
        console.log(err)
      },
      onSuccess(data) {
        if (data){
          if (data.result){
            setStatus("success")
            let list = (data as JsonRPCresult).result as UserResult[]
            setUserReqs(list)
            setPaging({...paging,
              next: list.length === paging.limit,
              prev: paging.page > 1,
            });

            ctx.FriendReqs[paging.page] = list
            ctx.FriendReqsLastUpdate[paging.page] = new Date()
          }
          else{
            setStatus("error")
            console.log(data.error)
          }
        }  
      },
    }
  )

  const hasMountedRef = React.useRef(false);
  React.useEffect(()=>{

    if (hasMountedRef.current) return
    hasMountedRef.current = true;

    if (props.setNavTitle) props.setNavTitle("Friend Request")
    if (status === "success" || status === "error"){
    
      setStatus("loading")
      refetch()
    }
    
    return
  },[])

  const nextSearching = () => {
    let nextPage = paging.page + 1
    setPaging({...paging,page : nextPage})
    navigate('/friendrequest?p='+nextPage);
    doSearching(nextPage+"")
  }

  const prevSearching = () => {
    let prevPage = paging.page - 1
    prevPage = prevPage <= 0? 1:prevPage
    setPaging({...paging,page : prevPage})
    navigate('/friendrequest?p='+prevPage);
    doSearching(prevPage+"")
  }

  const doSearching = (page: string) => {  
    setStatus('loading')
    let rpc = new JsonRPC2("SearchUser", {uid: props.user.uid, keyword:"", page : page, limit: ""+paging.limit, status:STATUS.Pending} )
    setRpc(rpc)
    // setTimeout(refetch,300)
  }

  return (<div className='w-full flex justify-center relative'>
    <div className='max-w-4xl w-full'>
      <LoadingBar loading={status==='loading'} />
      <div className='flex flex-col rounded-md bg-esecondary-color m-2 p-4 bg-opacity-50'>
        {
          (userReqs.length > 0) &&<p className='text-center mb-4'>You got friend request!</p>
        }
        <div className='flex flex-wrap gap-4 justify-center'>
          {
            userReqs && userReqs.map((o, index) => (
              o && <div key={o.username} className='flex flex-row gap-2 flex-1 min-w-[260px] max-w-lg justify-between border-l-2 px-1 sm:px-2 border-gray-700'>
                <Link to={process.env.PUBLIC_URL+"/profile?usr="+o.username} className="my-auto">
                  <Avatar className='h-14 w-14 rounded-full object-cover' src={(o.avatar.startsWith('/') ? API_URL : "" )+(o.avatar?o.avatar:"/image/404notfound")} alt={o.username}/>
                </Link>
                <div className='my-auto flex-1 overflow-hidden'>
                  <Link to={process.env.PUBLIC_URL+"/profile?usr="+o.username} className="hover:text-blue-400">
                    <p>{o.name}</p>
                    <p>@{o.username}</p>
                  </Link>
                  
                </div>
                <div className='flex w-20'>
                  <CttStatus contact={o.contact} uid={props.user.uid} target={o.username} />
                </div>
              </div>
            ))
          }
          {
            (userReqs.length %2 > 0) && <div className='flex-1 min-w-[260px] max-w-lg px-1 sm:px-2'></div>
          }
          {
            (userReqs.length === 0) &&<p>{statuss==='loading' || status==='loading' ? "Loading..." : "No friend request yet."}</p>
          }
        </div>
      {
        (userReqs.length > 0 || paging.page > 1 || statuss==='loading') && 
        <Pagination {...paging} 
          nextBtn={nextSearching} 
          prevBtn={prevSearching} 
          loading={statuss==='loading'}
        />
      }
      </div>
    </div>
  </div>
    
  );
};

export default FriendReqs;
