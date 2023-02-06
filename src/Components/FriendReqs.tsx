import React, {FC} from 'react';
import { User } from '../Entity/User/User_model';
import { Contact } from '../Entity/User/Contact_model';
import Pagination, { Paging } from './Pagination';
import { API_URL, UserCountResult } from '../global';
import { STATUS } from '../Entity/Enum';
import { JsonRPC2, JsonRPCresult } from '../lib/MyJsonRPC2';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import CttStatus from './CttStatus';


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
  const [userReqs, setUserReqs] = React.useState<UserResult[]>([])
  const [paging, setPaging] = React.useState<Paging>({
    next:false,
    prev:false,
    page:1,
    limit:UserCountResult})

  const [rpc, setRpc] = React.useState( new JsonRPC2("SearchUser", {
    uid: props.user.uid, 
    keyword: "", 
    page : paging.page+"", 
    limit: ""+paging.limit, 
    status:STATUS.Pending} ) )
  const { isLoading, error, refetch } = useQuery(
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
      refetchInterval: 5*60 * 1000,
      cacheTime: 5 * 60 * 1000,
      onError(err) {
        console.log("error")
        console.log(err)
      },
      onSuccess(data) {
        if (data){
          if (data.result){
            let list = (data as JsonRPCresult).result as UserResult[]
            setUserReqs(list)
            setPaging({...paging,
              next: list.length === paging.limit,
              prev: paging.page > 1,
            });
          }
          else{
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

    if (props.setNavTitle) props.setNavTitle("Home")

    // const queryCache = new QueryCache({
    //   onError: error => {
    //     console.log(error)
    //   },
   
    //   onSuccess: data => {
    //     console.log(data)
    //   }
    // })
   
    // const query = queryCache.find('GetSelf')
    // console.log(query)
    return
  },[])

  const nextSearching = () => {
    let nextPage = paging.page + 1
    setPaging({...paging,page : nextPage})
    doSearching(nextPage+"")
  }

  const prevSearching = () => {
    let prevPage = paging.page - 1
    prevPage = prevPage <= 0? 1:prevPage
    setPaging({...paging,page : prevPage})
    doSearching(prevPage+"")
  }

  const doSearching = (page: string) => {  
    let rpc = new JsonRPC2("SearchUser", {uid: props.user.uid, keyword:"", page : page, limit: ""+paging.limit, status:STATUS.Pending} )
    setRpc(rpc)
    setTimeout(refetch,300)
  }

  return (
    <div className='flex flex-col rounded-md bg-esecondary-color m-2 p-4'>
      {
        (userReqs.length > 0) &&<p className='text-center mb-4'>You got friend request!</p>
      }
      <div className='flex flex-wrap gap-4 justify-center'>
        {
          userReqs && userReqs.map((o, index) => (
            o && <div key={o.username} className='flex flex-row gap-2 flex-1 min-w-[260px] max-w-lg justify-between border-l-2 px-1 sm:px-2 border-gray-700'>
              <Link to={process.env.PUBLIC_URL+"/profile?usr="+o.username} className="my-auto">
                <Avatar className='h-14 w-14 rounded-full object-cover' src={API_URL+(o.avatar?o.avatar:"/image/404notfound")} alt={o.username}/>
              </Link>
              <div className='my-auto flex-1 overflow-hidden'>
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
          (userReqs.length %2 > 0) && <div className='flex-1 min-w-[260px] max-w-lg px-1 sm:px-2'></div>
        }
        {
          (userReqs.length === 0) &&<p>{isLoading ? "Loading..." : "No friend request yet."}</p>
        }
      </div>
    {
      (userReqs.length > 0 || paging.page > 1 || isLoading) && 
      <Pagination {...paging} 
        nextBtn={nextSearching} 
        prevBtn={prevSearching} 
        loading={isLoading}
      />
    }
    </div>
  );
};

export default FriendReqs;
