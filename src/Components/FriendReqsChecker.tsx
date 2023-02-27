import React from "react";
import { MdPersonAdd } from "react-icons/md";
import { Link } from "react-router-dom";
import { STATUS } from "../Entity/Enum";
import { JsonRPC2 } from "../lib/MyJsonRPC2";
import { myContext } from "../lib/Context";
import { useQuery } from "react-query";
import { API_URL } from "../global";

type Props = {
  uid:string;
}

const FriendReqsChecker: React.FC<Props> = (props) => {
  const ctx = React.useContext(myContext);
  const [rpc, setRpc] = React.useState( new JsonRPC2("SearchUserCount", {
    uid: props.uid, 
    keyword: "", 
    status:STATUS.Pending} ) )
  const deltaWaitSec = 5*60
  const [count, setCount] = React.useState(ctx.FriendReqsCount)
  const deltaSec = ctx.FriendReqsCountLastUpt ? (new Date().getTime() - ctx.FriendReqsCountLastUpt.getTime()) / 1000 : deltaWaitSec;
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
      enabled: deltaSec >= deltaWaitSec,
      onError(err) {
        console.log("error")
        console.log(err)
      },
      onSuccess(data) {
        if (data){
          if (data.result >= 0){
            ctx.FriendReqsCount = data.result as number
            ctx.FriendReqsCountLastUpt = new Date()
            setCount(data.result as number)
          }
          else{
            console.log(data.error)
          }
        }  
      },
    }
  )

  return (
    <>
    { count > 0 &&
      <div className="flex flex-col rounded-md sm:bg-esecondary-color m-2 px-4 py-2">
        <div className="w-fit">
          <Link to={process.env.PUBLIC_URL+"/friendrequest"} className="my-auto p-1 flex flex-row items-center text-eprimary-color hover:text-blue-400">
            <i className="p-2"><MdPersonAdd size={28}/></i>
            <span>You got {count} friend request!</span>
          </Link>
        </div>
      </div>
    }
    </>)
}

export default FriendReqsChecker

