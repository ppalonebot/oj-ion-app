/* eslint-disable @typescript-eslint/no-useless-constructor */

import { Trickle } from 'ion-sdk-js';
import { IonSFUJSONRPCSignal } from 'ion-sdk-js/lib/signal/json-rpc-impl';

class JsonRPCSignal extends IonSFUJSONRPCSignal {
  constructor(uri: string) {
    super(uri);
    this.socket.onopen = () => {
      console.log("ws onopen " + uri)
    }
    this.socket.onerror = (e:Event) => {
      console.log("ws onerror " + e)
    }
    this.socket.onclose = (e:CloseEvent) => {
      console.log("ws onclose " + e)
    }
    this.socket.onmessage = (event) => {
      const resp = JSON.parse(event.data);
      console.log("ws onmessage " + uri)
      console.log(resp)

      //todo: for webchat
    }
    
  }

  join(sid: string, uid: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    console.log("JsonRPCSignal send join: "+sid+", uid:"+uid)
    console.log(offer)
    return super.join(sid, uid, offer);
  }
  
  trickle(trickle: Trickle): void{
    console.log("-----JsonRPCSignal send trickle:"+trickle.target)
    console.log(trickle)
    return super.trickle(trickle)
  };

  offer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    console.log("JsonRPCSignal send offer:")
    console.log(offer)
    return super.offer(offer)
  }

  answer(answer: RTCSessionDescriptionInit): void {
    console.log("JsonRPCSignal send answer:")
    console.log(answer)
    return super.answer(answer)
  }


}

export default JsonRPCSignal