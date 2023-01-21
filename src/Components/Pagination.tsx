import React from 'react';

export type Paging = {
  next: boolean;
  prev: boolean;
  page: number;
  limit: number;
  nextBtn?: () => void;
  prevBtn?: () => void;
  loading?:boolean
}

const Pagination: React.FC<Paging> = (props) => {
  return (
    <div className="flex items-center justify-center p-2 mt-4">
      <button 
        onClick={props.prevBtn}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l ${!props.prev && 'bg-gray-600 hover:bg-gray-600'}`} 
        disabled={!props.prev || props.loading}
      >&lt;</button>
      <span className="w-14 text-center">{`${props.page}`}</span>
      <button 
        onClick={props.nextBtn}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r ${!props.next && 'bg-gray-600 hover:bg-gray-600'}`} 
        disabled={!props.next || props.loading}
      >&gt;</button>
    </div>
  );
}

export default Pagination;
