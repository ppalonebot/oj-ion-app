/* eslint-disable @typescript-eslint/no-useless-constructor */
import { Client, LocalStream, Signal } from 'ion-sdk-js';
import { Configuration } from 'ion-sdk-js/lib/client';

export default class OjClient extends Client {
  constructor(signal: Signal, config?: Configuration) {
    // Call the parent class' constructor to initialize the new OjClient instance
    super(signal, config);
  }

  // Override or extend existing methods as needed
  join(sid: string, uid: string): Promise<void> {
    console.log("OjClient join: "+sid+ ", uid:" + uid)
    // Call the parent class' join() method to perform the default behavior
    return super.join(sid, uid)//.then(() => {      
    //   if (this.transports){
    //     this.status = "connected"
    //   } else {
    //     this.status = "fail"
    //   }
    // });
  }

  publish(stream: LocalStream, encodingParams?: RTCRtpEncodingParameters[] | undefined): void {
    super.publish(stream,encodingParams)
    console.log("publish stream id: "+ stream.id)
  }
}