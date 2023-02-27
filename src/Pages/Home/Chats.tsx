import React, {FC} from 'react';
import { User } from '../../Entity/User/User_model';
import Pagination, { Paging } from '../../Components/Pagination';
import { API_URL, UserCountResult } from '../../global';
import { JsonRPC2, JsonRPCresult } from '../../lib/MyJsonRPC2';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../../Components/Avatar';
import { LastMessages } from '../../Entity/User/Contact_model';
import CheckedStatus from '../../Components/CheckedStatus';
import { FormatDate } from '../../lib/Utils';
import { myContext } from '../../lib/Context';
import LoadingBar from '../../Components/LoadingBar/LoadingBar';
import FriendReqsChecker from '../../Components/FriendReqsChecker';


interface Props {
  user: User;
  setNavTitle?: (t:string) => void
}

const Chats: FC<Props> = (props) => {
  const ctx = React.useContext(myContext);
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const initPage = isNaN(parseInt(searchParams.get('p') ?? "1")) ? 1 : parseInt(searchParams.get('p') ?? "1");
  
  const hasNextPage = ctx.Chats[initPage + 1]?.length > 0;
  const hasEnoughResults = ctx.Chats[initPage]?.length >= UserCountResult;
  const flag = (!hasNextPage && hasEnoughResults) || hasNextPage || hasEnoughResults;
  const [paging, setPaging] = React.useState<Paging>({
    next:flag,
    prev:initPage > 1,
    page:initPage,
    limit:UserCountResult});
  const [statuss, setStatus] = React.useState('idle');
  const [userChats, setUserChats] = React.useState<LastMessages[]>(ctx.Chats[initPage]??[]);
  const [rpc, setRpc] = React.useState( new JsonRPC2("GetLastMessages", {
    uid: props.user.uid, 
    page : paging.page+"", 
    limit: ""+paging.limit} ));
  const deltaWaitSec = 5*60
  const deltaSec = ctx.ChatsLastUpdate[initPage] ? (new Date().getTime() - ctx.ChatsLastUpdate[initPage].getTime()) / 1000 : deltaWaitSec;
  const { status, refetch,  } = useQuery(
    "LastMessages",
    () => fetch(API_URL+'/rm/rpc',
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
      enabled: deltaSec >= deltaWaitSec,
      onError(err) {
        setStatus("error")
        console.log("error")
        console.log(err)
      },
      onSuccess(data) {
        if (data){
          if (data.result){
            setStatus("success")
            let list = (data as JsonRPCresult).result as {rooms:LastMessages[],icons:any}
            if (list.icons.length > 0){
              for(let i =0 ; i< list.icons.length;i++){
                for(let j=0; j<list.rooms.length;j++){
                  if (list.rooms[j].room_id === list.icons[i].room_id){
                    list.rooms[j].icon_at = list.icons[i].at
                    list.rooms[j].icon_name = list.icons[i].name
                    list.rooms[j].icon_image = list.icons[i].image
                  }
                }
              }
            }
            
            setUserChats(list.rooms)
            setPaging({...paging,
              next: list.rooms.length === paging.limit,
              prev: paging.page > 1,
            });

            ctx.Chats[paging.page] = list.rooms
            ctx.ChatsLastUpdate[paging.page] = new Date()
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

    if (props.setNavTitle) props.setNavTitle("Chats")
    if (status === "success" || status === "error"){
      setStatus("loading")
      refetch()
    }

    return
  },[])

  const nextSearching = () => {
    let nextPage = paging.page + 1
    setPaging({...paging,page : nextPage})
    navigate('/?p='+nextPage);
    doSearching(nextPage+"")
  }

  const prevSearching = () => {
    let prevPage = paging.page - 1
    prevPage = prevPage <= 0? 1:prevPage
    setPaging({...paging,page : prevPage})
    navigate('/?p='+prevPage);
    doSearching(prevPage+"")
  }

  const doSearching = (page: string) => {  
    setStatus('loading')
    let rpc = new JsonRPC2("GetLastMessages", {uid: props.user.uid, page : page, limit: ""+paging.limit} )
    setRpc(rpc)
    // setTimeout(refetch,300)
  }

  const elements = []
  if (userChats) {
    let arr = userChats.sort((a, b) => (a.last_msg.time < b.last_msg.time) ? 1 : -1);
    for (let index = 0; index < arr.length ; index++) {
      const o = arr[index];
      if (!o) continue;
      const dt = FormatDate(o.last_msg.time);
      const element = (
      <div
        key={o.room_id}
        className="flex flex-row gap-2 flex-1 min-w-[260px] max-w-lg justify-between border-l-2 px-1 sm:px-2 border-gray-700"
      >
        <Link to={process.env.PUBLIC_URL + "/profile?usr=" + o.icon_at} className="my-auto">
          <Avatar
            className="h-14 w-14 rounded-full object-cover"
            src={API_URL + (o.icon_image ? o.icon_image : "/image/404notfound")}
            alt={o.icon_at}
          />
        </Link>
        <div className="my-auto flex-1 overflow-hidden">
          <Link to={process.env.PUBLIC_URL + "/message?usr=" + o.icon_at} className="hover:text-blue-400">
            <p>{o.icon_name}</p>
            <div className="flex flex-row items-center">
              {o.sender === props.user.username && <CheckedStatus status={o.last_msg.status} className="relative p-1" />}
              <p className="truncate text-gray-400">{o.last_msg.message}</p>
            </div>
          </Link>
        </div>
        <div className="relative w-10">
          <p className="absolute right-0 text-eprimary-color">{dt.isToday ? dt.time : dt.date}</p>
          {o.unread_c > 0 && (
            <p className="bottom-1 absolute w-full text-center font-bold text-sm">
              <span className="px-2 py-1 rounded-full bg-eprimary-color">{o.unread_c}</span>
            </p>
          )}
        </div>
      </div>
      );
      elements.push(element);
    }
  }

  return (
    <>
    <LoadingBar loading={status==='loading'} />
    <FriendReqsChecker uid={props.user.uid} />
    <div className='flex flex-col rounded-md sm:bg-esecondary-color m-2 p-4'>
      {
        (userChats.length > 0) &&<p className='text-center mb-4'>Last Messages</p>
      }
      <div className='flex flex-wrap gap-4 justify-center'>
        {elements}
        {
          (userChats.length %2 > 0) && <div className='flex-1 min-w-[260px] max-w-lg px-1 sm:px-2'></div>
        }
        {
          (userChats.length === 0) &&<p>{statuss==='loading' || (status==='loading') ? "Loading..." : "No result!"}</p>
        }
      </div>
    {
      (userChats.length > 0 || paging.page > 1 || statuss==='loading') && 
      <Pagination {...paging} 
        nextBtn={nextSearching} 
        prevBtn={prevSearching} 
        loading={statuss==='loading'}
      />
    }
    </div></>
  );
};

export default Chats;
