import React from 'react'
import OjClient from '../lib/OjClient';
import { LocalStream, RemoteStream } from 'ion-sdk-js';
import { Configuration, ActiveLayer} from 'ion-sdk-js/lib/client';
import { myContext } from '../lib/Context';
import { User } from '../Entity/User/User_model';
import { ContactDict } from '../Entity/User/Contact_model';
import { SortNames } from '../lib/Utils';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdMenu } from 'react-icons/md';
import { Transition } from '@headlessui/react';

export type EchoProps = {
  user:User
  target:ContactDict
}

const Echo: React.FC<EchoProps> = (props) =>{
  const ctx = React.useContext(myContext)
  const searchParams : URLSearchParams = new URLSearchParams(window.location.search)
  const owner = searchParams.get('usr')??""
  const navigate = useNavigate()

  const elWebcam = React.useRef<HTMLVideoElement>(null);
  const elSharedScreen = React.useRef<HTMLVideoElement>(null);
  const divRemote = React.useRef<HTMLDivElement>(null);
  // const [remoteVideoIsMuted, setRemoteVideoIsMuted] = React.useState<boolean>(true)
  const [mutedWebcamVideo, setMutedWebcamVideo] = React.useState<boolean>(true)
  const [mutedWebcamAudio, setMutedWebcamAudio] = React.useState<boolean>(true)

  const [localStream, setLocalStream] = React.useState<LocalStream | null>(null)
  const [localStreamSs, setLocalStreamSs] = React.useState<LocalStream | null>(null)

  const [client, setClient] = React.useState<OjClient | null>(null)
  const streams : Record<string, any> = {};
  const [showMenu, setShowMenu] = React.useState<boolean>(true)
  const [status, setStatus] = React.useState<string>("idle")

  const config : Configuration = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
    codec: 'vp8'
  }   

  const hasMountedRef = React.useRef(false);
  React.useEffect(():void => {
    if (hasMountedRef.current) return
    hasMountedRef.current = true;

    join()

  },[]);

  // const enableAudio = () =>{
  //   if (remoteVideoIsMuted) {
  //     // Unmute all the current videoElements.
  //     for (const streamInfo of Object.values(streams)) {
  //       let { videoElement } = streamInfo;
  //       videoElement.pause();
  //       videoElement.muted = false;
  //       videoElement.play();
  //     }
  //     // Set remoteVideoIsMuted to false so that all future autoplays
  //     // work.
  //     setRemoteVideoIsMuted(false)
  
  //     const button = document.getElementById("enable-audio-button");
  //     button?.remove();
  //   }
  // }

  const createVideoElement = (stream: RemoteStream) => {
    // Create a video element for rendering the stream
    const remoteVideo = document.createElement("video");
    remoteVideo.srcObject = stream;
    remoteVideo.autoplay = true;
    remoteVideo.className = "rounded-lg";
    
    const bg = document.createElement("div");
    // bg.style.backgroundImage = "url('"+process.env.PUBLIC_URL+"/default-avatar.jpg"+"')";
    bg.style.backgroundColor = "black"
    bg.style.backgroundSize = "cover";
    bg.style.backgroundPosition = "center";
    bg.style.display = "none";
    bg.style.width = "100%";
    bg.style.height = "0";
    bg.style.paddingBottom = "60%"//"56.25%"; // 16:9 aspect ratio
    bg.className = "rounded-lg";

    const controlsElement = document.createElement("div");
    controlsElement.style.display = 'block';
    controlsElement.style.position = 'absolute';
    controlsElement.style.bottom = '5px';
    controlsElement.style.right = '5px';

    const muteButton = document.createElement("button");
    muteButton.textContent = "Mute"
    muteButton.onclick = (event) => {
      event.stopPropagation();
      remoteVideo.muted = !remoteVideo.muted;
      muteButton.textContent = remoteVideo.muted ? "Unmute" : "Mute";
    };
    muteButton.className = "rounded-full bg-gray-700 text-white px-2 py-1 mr-2";
    controlsElement.appendChild(muteButton);
    

    const maximizeButton = document.createElement("button");
    maximizeButton.textContent = "Maximize";
    maximizeButton.onclick = (event) => {
      event.stopPropagation();
      remoteVideo.requestFullscreen();
    };
    maximizeButton.className = "rounded-full bg-gray-700 text-white px-2 py-1 mr-2";
    controlsElement.appendChild(maximizeButton);

    const container = document.createElement("div");
    container.className = "relative flex flex-col gap-2 flex-1 min-w-[260px] max-w-md justify-between border border-eprimary-color rounded-lg border-dashed p-[1px]";
    container.appendChild(bg);
    container.appendChild(remoteVideo);
    container.appendChild(controlsElement)

    divRemote?.current?.appendChild(container);
  
    // Save the stream, video element, and title element in the map.
    streams[stream.id] = { stream, videoElement: remoteVideo, background:bg, control: controlsElement};
    console.log("add stream id: " + stream.id);
  }

  const join = () =>{
    if (ctx.Comm && owner){
      if (client){
        leaving()
      }
      let cl = new OjClient(ctx.Comm, config)

      cl.ontrack = (track, stream) => {
        console.log("got track", track.id, "for stream", stream.id, "kind", track.kind);
        track.onended = () => {
          console.log("track ended", track.id, "for stream", stream.id, "kind", track.kind);
        };
        track.onunmute = () => {
          console.log("track onunmute", track.id, "for stream", stream.id, "kind", track.kind);
          if (track.kind === "video") {
            if (streams[stream.id]) {
              const { videoElement, background } = streams[stream.id];
              if (videoElement) {
                videoElement.style.display = "block";
                background.style.display = "none";
              }
            }
          }
        };
        track.onmute = () => {
          console.log("track onmute", track.id, "for stream", stream.id, "kind", track.kind);
          if (track.kind === "video") {
            if (streams[stream.id]) {
              const { videoElement, background } = streams[stream.id];
              if (videoElement) {
                videoElement.style.display = "none";
                background.style.display = "block";
              }
            }
          }
        };
      
        if (!streams[stream.id]) {
          createVideoElement(stream);
        }
      
        // When this stream removes a track, assume
        // that its going away and remove it.
        stream.onremovetrack = (ev) => {
          console.log("onremovetrack", ev.track.id, "for stream", stream.id, "kind", ev.track.kind);
          try {
            if (streams[stream.id]) {
              const { videoElement } = streams[stream.id];
              divRemote?.current?.removeChild(videoElement.parentElement);
              delete streams[stream.id];
              console.log("remove stream id: " + stream.id);
            }
          } catch (err) {
            console.log(err);
          }
        };
      };
      
      cl.ondatachannel = (ev: RTCDataChannelEvent) => {
        console.log("Echo ondatachannel")
        console.log(ev)
      };
      cl.onerrnegotiate = (role, err: Error, offer?: RTCSessionDescriptionInit, answer?: RTCSessionDescriptionInit) => {
        console.log("Echo onerrnegotiate, role: "+ (role ? "sub" : "pub"))
        if (err){
          leaving()
          setStatus("fail")
        }
      };
      cl.onactivelayer = (al: ActiveLayer) => {
        console.log("Echo onactivelayer")
        console.log(al)
      };
      cl.onspeaker = (ev: string[]) => {
        if (ev.length > 0){
          console.log("Echo onspeaker " + ev)
        }
      };

      setStatus("loading")
      const [firstName, secondName] = SortNames(owner, props.user.username);
      cl.join(firstName+"-"+secondName,props.user.username).then(()=>{
        console.log("OjClient join done")
        ctx.VicallCli = cl
        setClient(cl)
        setStatus("connected")
      }, () =>{
        leaving()
        setStatus("fail")
      })
      console.log("session: "+ firstName+"-"+secondName)
    }
  }

  const unpublish = () =>{
    if (!localStream) return
    const tracks = localStream.getTracks()
    if (tracks) tracks.forEach(track => {
      track.stop()
      console.log("stop",track.id, track.kind)
    });
    localStream.unpublish()
    setLocalStream(null)
    ctx.WebCam = null
  }

  const unpublishScreenSharing = () =>{
    console.log(localStreamSs)
    if (!localStreamSs) return
    const tracks = localStreamSs.getTracks()
    if (tracks) tracks.forEach(track => {
      track.stop()
      console.log("stop screen",track.id, track.kind)
    });
    localStreamSs.unpublish()
    setLocalStreamSs(null)
    ctx.SharedScreen = null
  }

  // if (localStream!== null) {
  //   localStream.getTracks()[0].removeEventListener("onended",unpublishScreenSharing)
  //   localStream.getTracks()[0].onended = unpublish
  // }

  // if (localStreamSs!== null) {
  //   localStreamSs.getTracks()[0].removeEventListener("onended",unpublishScreenSharing)
  //   localStreamSs.getTracks()[0].onended = unpublishScreenSharing
  // }

  const leave = () =>{
    leaving()
    navigate(process.env.PUBLIC_URL+'/profile?usr='+owner); 
  } 

  const leaving = () => {
    unpublish()
    unpublishScreenSharing()
    
    if (ctx.Comm) ctx.Comm.notify("leave-vicall","true")
    ctx.VicallCli = null
    client?.leave()
    setClient(null)
  }

  const publish = (event:boolean) => {
    if (event){
      if (localStream) {
        unpublish()
        return
      }
      console.log("start video")
      LocalStream.getUserMedia({
        resolution: "vga",
        video: true,
        audio: true,
        codec: "vp8",
      }).then((media):void => {
        media.unmute("audio")
        console.log("on set webcam stream")
        setMutedWebcamVideo(false)
        setMutedWebcamAudio(false)
        setLocalStream( media );
        elWebcam!.current!.srcObject = media;
        elWebcam!.current!.autoplay = true;
        elWebcam!.current!.controls = true;
        // localVideo!.current!.muted = false;
        client?.publish(media);
        ctx.WebCam = media
      }).catch(console.error);
    }
    else{
      if (localStreamSs) {
        unpublishScreenSharing()
        return
      }
      console.log("start screen")
      LocalStream.getDisplayMedia({
        resolution: 'hd',
        video: true,
        audio: true,
        codec: "vp8"
      }).then((media) => {
        console.log("on set screen stream")
        setLocalStreamSs( media );
        elSharedScreen!.current!.srcObject = media;
        elSharedScreen!.current!.autoplay = true;
        elSharedScreen!.current!.controls = true;
        // localSharedScreen!.current!.muted = false;
        client?.publish(media);
        ctx.SharedScreen = media
      }).catch(console.error);
    }
  }

  // const testmsg = () => {
  //   signalLocal?.notify("dmessage",{title:"testing", msg:"hello world"})
  //   console.log(signalLocal)
  // }

  const controlLocalVideo = () => {
    if (!localStream) return
    if (!mutedWebcamVideo) {
      setMutedWebcamVideo(true)
      localStream.mute("video");
    } else {
      if (localStreamSs){
        unpublishScreenSharing()
      }
      setMutedWebcamVideo(false)
      localStream.unmute("video");
    }
  }

  const controlLocalAudio = () => {
    if (!localStream) return
    if (!mutedWebcamAudio) {
      setMutedWebcamAudio(true)
      localStream.mute("audio");
      console.log("mute local audio")
    } else {
      setMutedWebcamAudio(false)
      localStream.unmute("audio");
      console.log("unmute local audio")
    }
  }

  const toggleMenu = () =>{
    setShowMenu(!showMenu)
  }

  return (<>
    <div className={`${client ? "" : "hidden"} relative min-h-screen max-h-screen overflow-hidden`}>
      <div className="absolute top-0 left-0 flex flex-row z-20 p-2">
        <button onClick={toggleMenu} className="bg-opacity-0 hover:bg-opacity-20 bg-blue-500 font-bold py-2 px-2 rounded-full"><MdMenu size={24} /></button>
      </div>
      <div className="absolute top-0 z-10 w-full">
        <Transition
        show={showMenu}
        enter="transition-all duration-300 transform ease-in-out"
        enterFrom="-translate-y-full opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition-all duration-300 transform ease-in-out"
        leaveFrom="translate-y-0 opacity-100"
        leaveTo="-translate-y-full opacity-0"
        >
          <div className='flex flex-row flex-wrap gap-2 justify-center p-2 mx-8'>
            {/* <button onClick={join} className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join</button> */}
            <button onClick={()=>publish(true)} className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">{localStream?"Unpublish":"Publish"}</button>
            <button onClick={()=>publish(false)} className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">{localStreamSs?"Stop sharing":"Share screen"}</button>
            <button onClick={leave} className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Leave</button>
          </div>
        </Transition>
      </div>
      
      <div ref={divRemote} className="flex items-center justify-center flex-wrap gap-2 w-full min-h-screen max-h-screen overflow-auto">
        <div className={`${localStream? "" :"hidden"} flex flex-col flex-1 min-w-[260px] max-w-md`}>
          <div className="relative flex flex-wrap gap-2 justify-end">
            <div className="absolute top-0 flex flex-row gap-2 z-10">
              <button onClick={unpublish} className="bg-opacity-0 hover:bg-opacity-20 bg-red-500 font-bold py-2 px-2 rounded"><MdClose size={20} /></button>
            </div>
          </div>
          <video
            ref={elWebcam}
            id="local-video"
            style={{
              backgroundColor: "black"
            }}
            controls={false}
            className="rounded-lg"
            defaultChecked />
          
        </div>
        <div className={`${localStreamSs? "visible" :"hidden invisible"} flex flex-col flex-1 min-w-[260px] max-w-md justify-between`}>
          <div className="relative flex flex-wrap gap-2 justify-end">
            <div className="absolute top-0 flex flex-row gap-2 z-10">
              <button onClick={unpublishScreenSharing} className="bg-opacity-0 hover:bg-opacity-20 bg-red-500 font-bold py-2 px-2 rounded"><MdClose size={20} /></button>
            </div>
          </div>
          <video
            ref={elSharedScreen}
            id="local-sscreen"
            style={{
              backgroundColor: "black"
            }}
            controls={false} 
            className="rounded-lg"
            defaultChecked/>
          
        </div>
      </div>
      
      {localStream && <div className="absolute bottom-0 z-10 w-full">
        <Transition
          show={showMenu}
          enter="transition-all duration-300 transform ease-in-out"
          enterFrom="translate-y-full opacity-0"
          enterTo="translate-y-0 opacity-100"
          leave="transition-all duration-300 transform ease-in-out"
          leaveFrom="translate-y-0 opacity-100"
          leaveTo="translate-y-full opacity-0"
        >
          <div className='flex flex-row flex-wrap gap-2 justify-center p-2 mb-4'>
            <button onClick={controlLocalVideo} className={`${mutedWebcamVideo? "bg-blue-500 hover:bg-blue-700" : "bg-gray-500 hover:bg-gray-700"} text-white font-bold py-2 px-4 rounded`}>Visual</button>
            <button onClick={controlLocalAudio} className={`${mutedWebcamAudio? "bg-blue-500 hover:bg-blue-700" : "bg-gray-500 hover:bg-gray-700"} text-white font-bold py-2 px-4 rounded`}>Audio</button>
          </div> 
        </Transition>
      </div>}
    </div>
    {status === "fail" ? <div>FAIL TO CONNECT</div> :
    status === "loading" ? <div>Loading...</div> : null}
  </>
  );
}

export default Echo;


