import React from 'react'
import OjClient from '../lib/OjClient';
import { LocalStream } from 'ion-sdk-js';
import { Configuration, ActiveLayer} from 'ion-sdk-js/lib/client';
import { myContext } from '../lib/Context';
import { User } from '../Entity/User/User_model';
import { ContactDict } from '../Entity/User/Contact_model';
import { SortNames } from '../lib/Utils';

export type EchoProps = {
  user:User
  target:ContactDict
}

const Echo: React.FC<EchoProps> = (props) =>{
  const ctx = React.useContext(myContext)
  const searchParams : URLSearchParams = new URLSearchParams(window.location.search)
  const owner = searchParams.get('usr')??""
  const localVideo = React.useRef<HTMLVideoElement>(null);
  const localSharedScreen = React.useRef<HTMLVideoElement>(null);
  const remotesDiv = React.useRef<HTMLDivElement>(null);
  const [remoteVideoIsMuted, setRemoteVideoIsMuted] = React.useState<boolean>(true)
  const [localVideoIsMuted, setLocalVideoIsMuted] = React.useState<boolean>(true)
  const [localAudioIsMuted, setLocalAudioIsMuted] = React.useState<boolean>(true)
  const [localStream, setLocalStream] = React.useState<LocalStream>()
  const [localStreamSs, setLocalStreamSs] = React.useState<LocalStream>()
  const [clientLocal, setClientLocal] = React.useState<OjClient | null>(null)

  const streams : Record<string, any> = {};
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

  },[]);

  const enableAudio = () =>{
    if (remoteVideoIsMuted) {
      // Unmute all the current videoElements.
      for (const streamInfo of Object.values(streams)) {
        let { videoElement } = streamInfo;
        videoElement.pause();
        videoElement.muted = false;
        videoElement.play();
      }
      // Set remoteVideoIsMuted to false so that all future autoplays
      // work.
      setRemoteVideoIsMuted(false)
  
      const button = document.getElementById("enable-audio-button");
      button?.remove();
    }
  }

  const join = () =>{
    if (ctx.Comm && owner){
      //todo: check other client in mycontext, meke sure only 1 client at the time
      if (clientLocal){
        return
      }
      let cl = new OjClient(ctx.Comm, config)

      cl.ontrack = (track, stream) => {
        console.log("got track", track.id, "for stream", stream.id);
        track.onended = () => {
          console.log("ended")
        }
        track.onunmute = () => {
          // If the stream is not there in the streams map.
          if (!streams[stream.id]) {
            // Create a video element for rendering the stream
            const remoteVideo = document.createElement("video");
            remoteVideo.srcObject = stream;
            remoteVideo.autoplay = true;
            remoteVideo.controls = false;
            remoteVideo.muted = remoteVideoIsMuted;
            remotesDiv?.current?.appendChild(remoteVideo);
            // Save the stream and video element in the map.
            streams[stream.id] = { stream, videoElement: remoteVideo };
      
            // When this stream removes a track, assume
            // that its going away and remove it.
            stream.onremovetrack = () => {
              try {
                if (streams[stream.id]) {
                  const { videoElement } = streams[stream.id];
                  remotesDiv?.current?.removeChild(videoElement);
                  delete streams[stream.id];
                }
              } catch (err) {}
            };
          }
        };
      };
      cl.ondatachannel = (ev: RTCDataChannelEvent) => {
        console.log("Echo ondatachannel")
        console.log(ev)
      };
      cl.onerrnegotiate = (role, err: Error, offer?: RTCSessionDescriptionInit, answer?: RTCSessionDescriptionInit) => {
        console.log("Echo onerrnegotiate, role: "+ (role ? "sub" : "pub"))
        console.log(offer)
        console.log(answer)
      };
      cl.onactivelayer = (al: ActiveLayer) => {
        console.log("Echo onactivelayer")
        console.log(al)
      };
      cl.onspeaker = (ev: string[]) => {
        console.log("Echo onspeaker")
        console.log(ev)
      };

      const [firstName, secondName] = SortNames(owner, props.user.username);
      cl?.join(firstName+"-"+secondName,owner).then(()=>{
        console.log("OjClient join done")
        //todo: add to mycontext
      
      })
      console.log("session: "+ firstName+"-"+secondName)
      setClientLocal(cl)
    }
  }

  const unpublish = () =>{
    if (!localStream) return
    const tracks = localStream.getTracks()
    if (tracks) tracks.forEach(track => {
      track.stop()
      localStream.removeTrack(track)
    });
    localStream.unpublish()
    setLocalStream(undefined)
  }

  const unpublishScreenSharing = () =>{
    if (!localStreamSs) return
    const tracks = localStreamSs.getTracks()
    if (tracks) tracks.forEach(track => {
      track.stop()
      localStreamSs.removeTrack(track)
    });
    localStreamSs.unpublish()
    setLocalStreamSs(undefined)
  }

  const leave = () =>{
    unpublish()
    unpublishScreenSharing()
    clientLocal?.leave()
    if (ctx.Comm) ctx.Comm.notify("leave-vicall",null)
    setClientLocal(null)
  }

  const publish = (event:boolean) => {
    if (event){
      if (localStream) return
      console.log("start video")
      LocalStream.getUserMedia({
        resolution: "vga",
        audio: true,
        codec: "vp8",
      }).then((media):void => {
        console.log("on set webcam stream")
        setLocalVideoIsMuted(false)
        setLocalStream( media );
        localVideo!.current!.srcObject = media;
        localVideo!.current!.autoplay = true;
        localVideo!.current!.controls = false;
        localVideo!.current!.muted = true;
        clientLocal?.publish(media);
      }).catch(console.error);
    }
    else{
      if (localStreamSs) return
      console.log("start screen")
      LocalStream.getDisplayMedia({
        resolution: 'hd',
        video: true,
        audio: true,
        codec: "vp8"
      }).then((media) => {
        console.log("on set screen stream")
        setLocalStreamSs( media );
        localSharedScreen!.current!.srcObject = media;
        localSharedScreen!.current!.autoplay = true;
        localSharedScreen!.current!.controls = false;
        localSharedScreen!.current!.muted = true;
        clientLocal?.publish(media);
      }).catch(console.error);
    }
  }

  // const testmsg = () => {
  //   signalLocal?.notify("dmessage",{title:"testing", msg:"hello world"})
  //   console.log(signalLocal)
  // }

  const controlLocalVideo = () => {
    if (!localVideoIsMuted) {
      setLocalVideoIsMuted(true)
      localStream?.mute("video");
    } else {
      setLocalVideoIsMuted(false)
      localStream?.unmute("video");
    }
  }

  const controlLocalAudio = () => {
    if (!localAudioIsMuted) {
      setLocalAudioIsMuted(true)
      localStream?.mute("audio");
    } else {
      setLocalAudioIsMuted(false)
      localStream?.unmute("audio");
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-row gap-2 justify-center my-4">
        <button onClick={join} className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join</button>
        <button onClick={()=>publish(true)} className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Publish Cam</button>
        <button onClick={()=>publish(false)} className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Share Screen</button>
        <button onClick={leave} className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Leave</button>
      </div>

      <div className="flex flex-wrap gap-4 justify-start">
        <div className="flex flex-col flex-1 min-w-[260px] justify-between">
          <video
            ref={localVideo}
            id="local-video"
            style={{
              backgroundColor: "black"
            }}
            controls={false}
            defaultChecked />
          <div className="relative flex flex-wrap gap-2 justify-center">
            <div className="absolute bottom-0 flex flex-row gap-2">
              <button onClick={controlLocalVideo} className={`${localVideoIsMuted? "bg-blue-500 hover:bg-blue-700" : "bg-gray-500 hover:bg-gray-700"} text-white font-bold py-2 px-4 rounded`}>Visual</button>
              <button onClick={controlLocalAudio} className={`${localAudioIsMuted? "bg-blue-500 hover:bg-blue-700" : "bg-gray-500 hover:bg-gray-700"} text-white font-bold py-2 px-4 rounded`}>Audio</button>
              <button onClick={unpublish} className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Close</button>
            </div>
          </div>
        </div>
        <div className={`${localStreamSs? "visible" :"hidden invisible"} flex flex-col flex-1 min-w-[260px] justify-between`}>
          <video
            ref={localSharedScreen}
            id="local-sscreen"
            style={{
              backgroundColor: "black"
            }}
            controls={false} />
          <div className="relative flex flex-wrap gap-2 justify-center">
            <div className="absolute bottom-0 flex flex-row gap-2">
              <button onClick={unpublishScreenSharing} className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Close</button>
            </div>
          </div>
        </div>
        <div ref={remotesDiv} id="remotes" className="flex flex-col gap-2 flex-1 min-w-[260px] justify-between">
          <div className="flex" id="enable-audio">
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                id="enable-audio-button"
                onClick={enableAudio}>
                Enable Audio
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Echo;


