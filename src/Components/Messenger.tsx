import React from 'react';
import { User } from '../Entity/User/User_model';
import { myContext } from '../lib/Context';
import { MdMarkChatUnread } from 'react-icons/md';
import { ContactDict, Message, TargetUser } from '../Entity/User/Contact_model';
import Balloon from './Balloon/Ballon';
import { MessageLimit } from '../global';
import { ContactData } from '../Entity/User/Contact_model';
import { FormatDate } from '../lib/Utils';

export type MessengerProps = {
  user:User
  setNavTitle?: (t:string) => void
  setNavSubTitle?: (t:string) => void
  target:ContactDict
}

const Messenger: React.FC<MessengerProps> = (props) => {
  const ctx = React.useContext(myContext)
  const searchParams = new URLSearchParams(window.location.search)
  const owner = searchParams.get('usr')??""
  const [target] = React.useState<ContactDict>(props.target)
  const msgContainerRef = React.useRef<HTMLDivElement>(null)
  const [btnLoad,setBtnLoad] = React.useState(false)
  const divsRef = React.useRef<HTMLDivElement[]>([]);
  const [visibleMsgs, setVisibleMsgs] = React.useState<string[]>([]);
  
  const hasMountedRef = React.useRef(false);
  React.useLayoutEffect(() => {
    if (hasMountedRef.current) return

    setTimeout(() => { // add timeOut 
      if (msgContainerRef.current) {
        if (target[owner]){
          if (target[owner].datas.firstLoad){
            msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight
            target[owner].datas.firstLoad = msgContainerRef.current.scrollTop === 0
          }
        }
      }
      handleScroll()  
    }, 300);
    
    if (msgContainerRef.current) {
      if (target[owner]){
        if (target[owner].datas.firstLoad){
          msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight 
          target[owner].datas.firstLoad = msgContainerRef.current.scrollTop === 0
        } else if (target[owner].datas.topMsgTimeId && target[owner].datas.topMsgTimeId !== ""){
          const element = msgContainerRef.current!.querySelector ('#id'+target[owner].datas.topMsgTimeId) as HTMLElement
          if (element) {
            msgContainerRef.current.scrollTop = element.offsetTop - 200
          }
          target[owner].datas.topMsgTimeId = ""
        } else {
          msgContainerRef.current.scrollTop = target[owner].datas.scroll >= 96? 
            msgContainerRef.current.scrollHeight : ((msgContainerRef.current.scrollTop / (msgContainerRef.current.scrollHeight - msgContainerRef.current.clientHeight)) * 100) >= 90 ?  
              msgContainerRef.current.scrollHeight : ((target[owner].datas.height - msgContainerRef.current.scrollHeight+8)+(target[owner].datas.scroll/100*(msgContainerRef.current.scrollHeight - msgContainerRef.current.clientHeight)))
        }
        target[owner].datas.height = msgContainerRef.current.scrollHeight
      } else {
        msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight 
      }
      
    } 
    handleScroll()   
  }, []);

  React.useEffect(()=>{
    if (hasMountedRef.current) return
    hasMountedRef.current = true;

    if (props.setNavTitle) props.setNavTitle( target[owner] ? target[owner].name : "@"+owner)
    if (props.setNavSubTitle && target[owner]) props.setNavSubTitle( target[owner].datas.wsStatus)
    if (ctx.Comm !== null && owner && !target[owner]) {
      //init data:
      let d: ContactData = {
        updated: new Date(),
        wsStatus: "",
        messages: [],
        room: {},
        scroll: 0,
        height: 0,
        page: 0,
        newMsgCount: 0,
        firstLoad: true,
        isActive: false,
        isFriend: false,
      } as unknown as ContactData
      target[owner] = {username:owner, avatar:"",contact:{},datas:d,name:""} as TargetUser

      ctx.Comm.notify('join-room-private',{  
        action: 'join-room-private', 
        message: owner,
        status:"sent", 
        time:(new Date()).toISOString()
      })
    }

    return
  },[])

  const handleScroll = () => {
    if (target[owner] && msgContainerRef.current) {
      let d = msgContainerRef.current.scrollHeight - msgContainerRef.current.clientHeight
      target[owner].datas.scroll = d === 0 ? target[owner].datas.scroll : (msgContainerRef.current.scrollTop / d) * 100;

      const viewportHeight = window.innerHeight;
      const scrollTop = window.scrollY || window.pageYOffset;
      const viewportTop = scrollTop + 30;
      const viewportBottom = scrollTop + viewportHeight -30;

      const newVisibleDivs: string[] = [];

      divsRef.current.forEach((div) => {
        const rect = div.getBoundingClientRect();

        if (rect.top >= viewportTop && rect.bottom <= viewportBottom) {
          newVisibleDivs.push(div.dataset.id || '');
          let id = div.getAttribute('id')
          if (id && id.length > 0 && ctx.Comm){
            id = id.substring(2)
            for(let i =0 ; i< target[owner].datas.messages.length; i++){
              if(target[owner].datas.messages[i].id === id){
                if (target[owner].datas.messages[i].status === "read") continue
                if (target[owner].datas.messages[i].sender?.username === props.user.username) continue

                target[owner].datas.messages[i].status = "read"
                let _msg = {
                  action: 'read',
                  message: target[owner].datas.messages[i].id,
                  target: {
                    id: target[owner].datas.room.id,
                    name: target[owner].datas.room.name
                  },
                } as Message
                ctx.Comm.notify('read',_msg)
                break
              }
            }
          }
        }
      });

      setVisibleMsgs(newVisibleDivs);
    }
  };

  const loadMoreMessage = () =>{
    if (target[owner] && target[owner].datas.page >=0 && ctx.Comm){
      setBtnLoad(true)
      let page = target[owner].datas.page + Math.floor(target[owner].datas.newMsgCount/MessageLimit) +1
      if (target[owner].datas.messages.length> 0) target[owner].datas.topMsgTimeId = target[owner].datas.messages[0].id
      ctx.Comm.notify('get-msg',{
        action: 'get-msg',
        message: page+","+MessageLimit,
        target: {
          id: target[owner].datas.room.id,
          name: target[owner].datas.room.name
        }
      } as Message)
    }
  }

  let scrolToUnread = ""

  const scrollToNewMsg = () =>{
    if (msgContainerRef.current) {
      const element = msgContainerRef.current.querySelector(`[data-id="${scrolToUnread}"]`) as HTMLElement
      if (element){
        msgContainerRef.current.scrollTo({
          top: element.offsetTop,
          behavior: 'smooth'
        });
      }
    }
  }

  const msgElements = []
  if (target[owner]){
    let myDates:Array<string> = []
    for (let i=0;i<target[owner].datas.messages.length; i++) {
      const message = target[owner].datas.messages[i]
      const dt = FormatDate(message.time)
      const localTimeString = dt.time
      const formattedDate = dt.date
      if (!myDates.includes(formattedDate)){
        myDates.push(formattedDate)
        msgElements.push(<div key={formattedDate} className='text-gray-400 text-small text-center h-10 pt-2'><span className='rounded-full py-2 px-4 bg-esecondary-color'>{formattedDate}</span></div>)
      }
      msgElements.push(
        <div key={message.time} ref={(el) => {
          if (el) {
            divsRef.current[target[owner].datas.messages.indexOf(message)] = el;
          }
        }}
        data-id={message.time} id={"id"+message.id} data-status={message.status} className={message.sender!.username === props.user.username ? 'flex flex-row justify-end p-2':'flex flex-row justify-start p-2'}>
          <Balloon 
            msgid={message.id}
            time={localTimeString}
            status={message.status}
            // visible={visibleMsgs.includes(message.time)}
            isLeft={message.sender!.username !== props.user.username}>
              {message.message}
          </Balloon>
        </div> 
      )
      if (scrolToUnread === "" && message.status !== "read" && message.sender!.username !== props.user.username && target[owner].datas.scroll < 98) {
        scrolToUnread = message.time
      }
    }
  }
  return (
    <>
    <div ref={msgContainerRef} onScroll={handleScroll} className="flex-1 overflow-auto flex justify-center w-full">
      <div className="max-w-3xl w-full">
        <div className='h-10 w-full'>
        {!btnLoad && target[owner] && target[owner].datas.page >=0 && <button onClick={loadMoreMessage} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Load</button>}
        </div>
        {msgElements}
      </div>
    </div>
    {scrolToUnread !== "" && <div className='relative'>
      <button onClick={scrollToNewMsg} className='absolute bottom-2 left-2 p-3 bg-blue-500 hover:bg-blue-700 rounded-full'><MdMarkChatUnread size={28} /></button>
    </div>}
    </>
  );
};
export default Messenger;