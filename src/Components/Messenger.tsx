import * as React from 'react';
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
  const msgContainerRef = React.useRef<HTMLDivElement>(null)
  const [btnLoad,setBtnLoad] = React.useState(false)
  const divsRef = React.useRef<HTMLDivElement[]>([]);
  const [visibleMsgs, setVisibleMsgs] = React.useState<HTMLDivElement[]>([]);
  const [scrolToUnread, setScrolToUnread] = React.useState<string>('')
  let intervalId: any;
  
  const hasMountedRef = React.useRef(false);
  React.useLayoutEffect(() => {
    if (hasMountedRef.current) return

    setTimeout(() => { // add timeOut 
      if (msgContainerRef.current) {
        if (props.target[owner]){
          if (props.target[owner].datas.firstLoad){
            msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight
            props.target[owner].datas.firstLoad = msgContainerRef.current.scrollTop === 0
          }
        }
      }
      handleScroll()  
    }, 300);
    
    if (msgContainerRef.current) {
      if (props.target[owner]){
        if (props.target[owner].datas.firstLoad){
          msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight 
          props.target[owner].datas.firstLoad = msgContainerRef.current.scrollTop === 0
        } else if (props.target[owner].datas.topMsgTimeId && props.target[owner].datas.topMsgTimeId !== ""){
          const element = msgContainerRef.current!.querySelector ('#id'+props.target[owner].datas.topMsgTimeId) as HTMLElement
          if (element) {
            msgContainerRef.current.scrollTop = element.offsetTop - 200
          }
          props.target[owner].datas.topMsgTimeId = ""
        } else {
          msgContainerRef.current.scrollTop = props.target[owner].datas.scroll >= 92? 
            msgContainerRef.current.scrollHeight : ((msgContainerRef.current.scrollTop / (msgContainerRef.current.scrollHeight - msgContainerRef.current.clientHeight)) * 100) >= 90 ?  
              msgContainerRef.current.scrollHeight : ((props.target[owner].datas.height - msgContainerRef.current.scrollHeight+8)+(props.target[owner].datas.scroll/100*(msgContainerRef.current.scrollHeight - msgContainerRef.current.clientHeight)))
        }
        props.target[owner].datas.height = msgContainerRef.current.scrollHeight
      } else {
        msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight 
      }
      
    } 
    handleScroll()   
  }, []);

  React.useEffect(()=>{
    if (hasMountedRef.current) return
    hasMountedRef.current = true;

    if (props.setNavTitle) props.setNavTitle( props.target[owner] ? props.target[owner].name : "@"+owner)
    if (props.setNavSubTitle && props.target[owner]) props.setNavSubTitle( props.target[owner].datas.wsStatus)
    if (ctx.Comm !== null && owner && !props.target[owner]) {
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
      props.target[owner] = {username:owner, avatar:"",contact:{},datas:d,name:""} as TargetUser

      ctx.Comm.notify('join-room-private',{  
        action: 'join-room-private', 
        message: owner,
        status:"sent", 
        time:(new Date()).toISOString()
      })
    }

    return
  },[])

  const onCalculateScroll = (msg: string) => {
    if (msg === 'start') {
      if (!intervalId) {
        intervalId = setTimeout(() => {
          if (props.target[owner] && msgContainerRef.current) {
            let d = msgContainerRef.current.scrollHeight - msgContainerRef.current.clientHeight
            props.target[owner].datas.scroll = d === 0 ? props.target[owner].datas.scroll : (msgContainerRef.current.scrollTop / d) * 100;

            const viewportHeight = window.innerHeight;
            const scrollTop = window.scrollY || window.pageYOffset;
            const viewportTop = scrollTop + 30;
            const viewportBottom = scrollTop + viewportHeight -30;
            const newVisibleDivs: HTMLDivElement[] = [];

            divsRef.current.forEach((div) => {
              const rect = div.getBoundingClientRect();
              if (rect.top >= viewportTop && rect.bottom <= viewportBottom) {
                newVisibleDivs.push(div);
                let id = div.getAttribute('id')
                if (id && id.length > 0 && ctx.Comm){
                  id = id.substring(2)
                  for(let i =0 ; i< props.target[owner].datas.messages.length; i++){
                    if(props.target[owner].datas.messages[i].id === id){
                      if (props.target[owner].datas.messages[i].status === "read") continue
                      if (props.target[owner].datas.messages[i].sender?.username === props.user.username) continue
  
                      props.target[owner].datas.messages[i].status = "read"
                      let _msg = {
                        action: 'read',
                        message: props.target[owner].datas.messages[i].id,
                        target: {
                          id: props.target[owner].datas.room.id,
                          name: props.target[owner].datas.room.name
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
          onCalculateScroll("stop")
        }, 1000);
      }
    } else if (msg === 'stop') {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    }
  };

  const handleScroll = () => {
    onCalculateScroll("start")
  };

  const loadMoreMessage = () =>{
    if (props.target[owner] && props.target[owner].datas.page >=0 && ctx.Comm){
      setBtnLoad(true)
      let page = props.target[owner].datas.page + Math.floor(props.target[owner].datas.newMsgCount/MessageLimit) +1
      if (props.target[owner].datas.messages.length> 0) props.target[owner].datas.topMsgTimeId = props.target[owner].datas.messages[0].id
      ctx.Comm.notify('get-msg',{
        action: 'get-msg',
        message: page+","+MessageLimit,
        target: {
          id: props.target[owner].datas.room.id,
          name: props.target[owner].datas.room.name
        }
      } as Message)
    }
  }

  const scrollToNewMsg = () =>{
    if (msgContainerRef.current) {
      const element = msgContainerRef.current.querySelector(`[data-id="${scrolToUnread}"]`) as HTMLElement
      if (element){
        setScrolToUnread('')
        msgContainerRef.current.scrollTo({
          top: element.offsetTop,
          behavior: 'smooth'
        });
      }
    }
  }

  const msgElements = []
  if (props.target[owner]){
    let myDates:Array<string> = []
    for (let i=0;i<props.target[owner].datas.messages.length; i++) {
      const message = props.target[owner].datas.messages[i]
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
            divsRef.current[props.target[owner].datas.messages.indexOf(message)] = el;
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
      if (scrolToUnread === "" && message.status !== "read" && message.sender!.username !== props.user.username && props.target[owner].datas.scroll < 92) {
        setScrolToUnread(message.time)
        break
      }
    }
  }

  return (
    <>
    <div ref={msgContainerRef} onScroll={handleScroll} className="flex-1 overflow-auto flex justify-center w-full bg-black bg-opacity-75">
      <div className="max-w-3xl w-full">
        <div className='h-10 w-full'>
        {!btnLoad && props.target[owner] && props.target[owner].datas.page >=0 && <button onClick={loadMoreMessage} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Load</button>}
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