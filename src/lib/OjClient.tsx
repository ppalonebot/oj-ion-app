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
      //handshaking is done, the most important result is tansports
      //transports[0] for publish data (video/audio) to other
      //transport[1] for receive data from other
      //tranports[0].pc and tranports[0].api are used to start the stream
      //tranports[1].pc.ontrack trigger this.ontrack to get data stream from other
    //   console.log("OjClient join done:")
    //   console.log(this.transports)
      
    // });
  }

  publish(stream: LocalStream, encodingParams?: RTCRtpEncodingParameters[] | undefined): void {
    super.publish(stream,encodingParams)
    console.log("publish media id: "+ stream.id)
  }
}