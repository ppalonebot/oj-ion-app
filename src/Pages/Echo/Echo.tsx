import React from 'react'
import './Echo.css';
import JsonRPCSignal from '../../lib/JsonRPCSignal';
import OjClient from '../../lib/OjClient';
import { LocalStream } from 'ion-sdk-js';
import { Configuration, ActiveLayer} from 'ion-sdk-js/lib/client';

const Echo = () => {
  const localVideo = React.useRef<HTMLVideoElement>(null);
  const remotesDiv = React.useRef<HTMLDivElement>(null);
  const joinBtns = React.useRef<HTMLDivElement>(null);
  const [remoteVideoIsMuted, setRemoteVideoIsMuted] = React.useState<boolean>(true)
  const [localVideoIsMuted, setLocalVideoIsMuted] = React.useState<boolean>(true)
  const [localAudioIsMuted, setLocalAudioIsMuted] = React.useState<boolean>(true)
  const [localStream, setLocalStream] = React.useState<LocalStream>()

  const params : URLSearchParams = new URLSearchParams(window.location.search)
  const serverUrl : string = "ws://"+window.location.hostname+":7000/ws"

  const streams : Record<string, any> = {};
  const config : Configuration = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
    codec: 'vp8'
  }

 const [signalLocal, setSignalLocal] = React.useState<JsonRPCSignal | null>(null)
 const [clientLocal, setClientLocal] = React.useState<OjClient | null>(null)

  let onlyOnce = 0
  React.useEffect(():void => {
    if (onlyOnce === 0){
      onlyOnce = 1
      console.log("on effect")
      let sl = new JsonRPCSignal(serverUrl)
      let cl = new OjClient(sl, config)

      sl.onopen = () => cl?.join(params !== null && params.has("session") ? params.get("session") as string : "iontesting","");
      setSignalLocal(sl)
      cl.ontrack = (track, stream) => {
        console.log("got track", track.id, "for stream", stream.id);
        track.onunmute = () => {
          // If the stream is not there in the streams map.
          if (!streams[stream.id]) {
            // Create a video element for rendering the stream
            const remoteVideo = document.createElement("video");
            remoteVideo.srcObject = stream;
            remoteVideo.autoplay = true;
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
      setClientLocal(cl)
    }
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

  const start = (event:boolean) => {
    if (event){
      console.log("start video")
      LocalStream.getUserMedia({
        resolution: "vga",
        audio: true,
        codec: "vp8",
      }).then((media):void => {
        console.log("on set local stream")
        setLocalVideoIsMuted(false)
        setLocalStream( media );
        localVideo!.current!.srcObject = media;
        localVideo!.current!.autoplay = true;
        localVideo!.current!.controls = true;
        localVideo!.current!.muted = true;
        clientLocal?.publish(media);
        // joinBtns!.current!.style.display = "none"
      }).catch(console.error);
    }
    else{
      console.log("start screen")
      LocalStream.getDisplayMedia({
        resolution: 'hd',
        video: true,
        audio: true,
        codec: "vp8"
      }).then((media) => {
        localVideo!.current!.srcObject = media;
        localVideo!.current!.autoplay = true;
        localVideo!.current!.controls = true;
        localVideo!.current!.muted = true;
        clientLocal!.publish(media);
      }).catch(console.error);
    }
  }

  const testmsg = () => {
    signalLocal?.notify("dmessage",{title:"testing", msg:"hello world"})
    console.log(signalLocal)
  }

  const controlLocalVideo = (e: React.MouseEvent<HTMLInputElement>) => {
    let radio: HTMLInputElement = e.currentTarget;
    if (radio.value === "false") {
      setLocalVideoIsMuted(true)
      localStream?.mute("video");
    } else {
      setLocalVideoIsMuted(false)
      localStream?.unmute("video");
    }
  }

  const controlLocalAudio = (e : React.MouseEvent<HTMLInputElement>) => {
    let radio: HTMLInputElement = e.currentTarget;
    if (radio.value === "false") {
      setLocalAudioIsMuted(true)
      localStream?.mute("audio");
    } else {
      setLocalAudioIsMuted(false)
      localStream?.unmute("audio");
    }
  }

  return (
    <>
      <nav className="navbar navbar-light bg-light border-bottom">
        <h3>Pion</h3>
      </nav>
      <div className="container pt-4">
        <div className="row" id="start-btns" ref={joinBtns}>
        <div className="col-6">
            <button type="button" className="btn btn-primary" onClick={()=>start(true)}>
              Publish
            </button>
          </div>
          <div className="col-6">
            <button type="button" className="btn btn-primary" onClick={()=>start(false)}>
              Publish Screen
            </button>
          </div>
          <div className="col-6">
            <button type="button" className="btn btn-primary" onClick={testmsg}>
              send test msg
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col-6 pt-2">
            <span
              style={{
                position: 'absolute',
                marginLeft: '5px',
                marginTop: '5px'
              }}
              className="badge badge-primary"
              >Local</span
            >
            <video
              ref={localVideo}
              id="local-video"
              style={{
                backgroundColor: "black"
              }}
              width="320"
              height="240"
              defaultChecked
            ></video>
            <div className="controls">
              <div className="row pt-3">
                <div className="col-3">
                  <strong>Video</strong>
                  <div className="radio">
                    <label
                      ><input
                        type="radio"
                        onClick={controlLocalVideo}
                        value="true"
                        name="optlocalvideo"
                        checked={!localVideoIsMuted}
                      />
                      Unmute</label
                    >
                  </div>
                  <div className="radio">
                    <label
                      ><input
                        type="radio"
                        onClick={controlLocalVideo}
                        value="false"
                        name="optlocalvideo"
                        checked={localVideoIsMuted}
                      />
                      Mute</label
                    >
                  </div>
                </div>
                <div className="col-3">
                  <strong>Audio</strong>
                  <div className="radio">
                    <label
                      ><input
                        type="radio"
                        onClick={controlLocalAudio}
                        value="true"
                        name="optlocalaudio"
                        checked={!localAudioIsMuted}
                      />
                      Unmute</label
                    >
                  </div>
                  <div className="radio">
                    <label
                      ><input
                        type="radio"
                        onClick={controlLocalAudio}
                        value="false"
                        name="optlocalaudio"
                        checked={localAudioIsMuted}
                      />
                      Mute</label
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div ref={remotesDiv} id="remotes" className="col-6 pt-2">
            <span className="badge badge-primary">Remotes</span>

            <div className="row" id="enable-audio">
              <div className="col-12">
                <button
                  type="button"
                  className="btn btn-primary"
                  id="enable-audio-button"
                  onClick={enableAudio}
                >
                  Enable Audio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Echo;


