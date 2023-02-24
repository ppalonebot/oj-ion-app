import React from "react";
import { MdPersonAdd } from "react-icons/md";
import { Link } from "react-router-dom";

type Props = {
  uid:string;
}

const FriendReqsChecker: React.FC<Props> = (props) => {

  return (
    <div className="flex flex-col rounded-md sm:bg-esecondary-color m-2 px-4 py-2">
      <div className="w-fit">
        <Link to={process.env.PUBLIC_URL+"/friendrequest"} className="my-auto p-1 flex flex-row items-center text-eprimary-color hover:text-blue-400">
          <i className="p-2"><MdPersonAdd size={28}/></i>
          <span>New friend request!</span>
        </Link>
      </div>
    </div>
  )
}

export default FriendReqsChecker

