/* eslint-disable @typescript-eslint/no-useless-constructor */

import { Trickle } from 'ion-sdk-js';
import { IonSFUJSONRPCSignal } from 'ion-sdk-js/lib/signal/json-rpc-impl';
import { JsonRPC2 } from './MyJsonRPC2';
import { ContactDict, Message, Messages, Room, TargetUser } from '../Entity/User/Contact_model';
import { MessageLimit } from '../global';
import { User } from '../Entity/User/User_model';

const initialReconnectDelay = 1000
const maxReconnectDelay = 16000

class JsonRPCSignal extends IonSFUJSONRPCSignal {
  currentUser:User
  isWsConnected: boolean
  setIsWsConnected: (state: boolean) => void
  currentReconnectDelay:number
  setCurrentReconnectDelay: (delay: number) => void
  reconnectWs: () => void
  contact: ContactDict
  setContact : (contactDict: ContactDict) => void
  updateMessagePage : (username:string,navTitle:string, subNavTitle:string) => void
  updateChatPage: () => void

  constructor(uri: string, 
    currentUser:User,
    isWsConnected: boolean, 
    setIsWsConnected: (state: boolean) => void,
    currentReconnectDelay:number,
    setCurrentReconnectDelay: (delay: number) => void,
    reconnectWs: () => void,
    contact: ContactDict, 
    setContact : (contact: ContactDict) => void,
    updateMessagePage : (username:string,navTitle:string, subNavTitle:string) => void,
    updateChatPage: () => void,
  ) {

    super(uri);
    this.socket.onmessage = (event: MessageEvent<any>) => {
      const jsonStrings = event.data.split(/\r?\n/);
      if (jsonStrings.length > 1){
        try {
          const myObject = JSON.parse(event.data);
          //handled by parent class
        } catch (e) {
          for (const jsonString of jsonStrings) {
            try {
              const resp = JSON.parse(jsonString);
              if (resp.method === 'offer') {
                if (this.onnegotiate)
                    this.onnegotiate(resp.params);
              } else if (resp.method === 'trickle') {
                if (this.ontrickle)
                    this.ontrickle(resp.params);
              } else {
                switch (resp.method) {
                  case "info":
                    this.handleInfo(resp.params)
                    break;
                  case "read":
                    this.handleHasBeenRead(resp.params)
                    break;
                  case "delv":
                    this.handleDelivered(resp.params)
                    break;
                  case "get-msg":
                    this.handleGetMessage(resp.params)
                    break;
                  case "send-message":
                    this.handleChatMessage(resp.params);
                    break;
                  case "user-join":
                    this.handleUserJoined(resp.params);
                    break;
                  case "user-left":
                    this.handleUserLeft(resp.params);
                    break;
                  case "room-joined":
                    this.handleRoomJoined(resp.params)
                    break;
                  default:
                    console.log(resp)
                    break;
                }
              }
            } catch (err) {
              console.error(`Error parsing JSON: ${err}`);
            }
          }
        }
      }
    }
    this.currentUser = currentUser
    this.isWsConnected = isWsConnected
    this.setIsWsConnected = setIsWsConnected
    this.currentReconnectDelay = currentReconnectDelay
    this.setCurrentReconnectDelay = setCurrentReconnectDelay
    this.reconnectWs = reconnectWs
    this.contact = contact
    this.setContact = setContact
    this.updateMessagePage = updateMessagePage
    this.updateChatPage = updateChatPage

    this.onopen = this.onWebsocketOpen
    this.onclose = this.onWebsocketClose
    this.on_notify('info',this.handleInfo)
    this.on_notify('read',this.handleHasBeenRead)
    this.on_notify('delv',this.handleDelivered)
    this.on_notify('get-msg',this.handleGetMessage)
    this.on_notify('send-message',this.handleChatMessage)
    this.on_notify('user-join',this.handleUserJoined)
    this.on_notify('user-left',this.handleUserLeft)
    this.on_notify('room-joined',this.handleRoomJoined)
  }

  handleRoomJoined = (msg:any) => {
    console.log(msg)
    if (this.contact[msg.sender.username]){
      if (this.contact[msg.sender.username].datas.firstLoad){
        let sender = msg.sender as TargetUser
        this.contact[msg.sender.username].avatar = sender.avatar
        this.contact[msg.sender.username].contact = sender.contact
        this.contact[msg.sender.username].name = sender.name
        this.contact[msg.sender.username].username = sender.username
        if (msg.target){
          this.notify('get-msg',{
            action: 'get-msg',
            message: "1,"+MessageLimit,
            target: {
              id: msg.target.id,
              name: msg.target.name
            }
          } as Message)
        }
      }
      this.contact[msg.sender.username].datas.wsStatus = msg.message !== "" ? msg.message: this.contact[msg.sender.username].datas.wsStatus
      this.contact[msg.sender.username].datas.updated = new Date()
      this.contact[msg.sender.username].datas.room = msg.target as Room
      this.contact[msg.sender.username].datas.isFriend = true

      this.setContact(this.contact)
      this.updateMessagePage(msg.sender.username,this.contact[msg.sender.username].name,this.contact[msg.sender.username].datas.wsStatus)
    }
  }

  setContactWsStatus = (username: string,name:string, sta:string) => {
    if (this.contact[username]){
      this.contact[username].datas.wsStatus = sta
      this.contact[username].datas.updated = new Date()
      this.setContact(this.contact)
      this.updateMessagePage(username,this.contact[username].name,this.contact[username].datas.wsStatus)
    }
  }

  handleUserJoined = (msg:any) => {
    console.log(msg)
    this.setContactWsStatus(msg.sender.username,msg.sender.name,"online")
  }

  handleUserLeft = (msg:any) => {
    console.log(msg)
    this.setContactWsStatus(msg.sender.username,msg.sender.name,"offline")
  }

  handleChatMessage = (msg:any) => {
    console.log(msg)
    if (this.contact){
      let message = msg as Message
      let found = false
      for (const key in this.contact) {
        if (this.contact.hasOwnProperty(key)) {
          if (this.contact[key].datas.room.id === message.target!.id){
            
            this.contact[key].datas.updated = new Date()
            if (this.currentUser.username === message.sender!.username){
              for(let i = this.contact[key].datas.messages.length - 1; i >= 0; i--){
                if (this.contact[key].datas.messages[i].time === message.time){
                  found = true
                  this.contact[key].datas.messages[i] = message
                  break
                }
              }
            }
            
            if (!found) this.contact[key].datas.messages.push(message)
            found = true
            this.contact[key].datas.newMsgCount +=1
            this.updateMessagePage(key,this.contact[key].name,this.contact[key].datas.wsStatus)
            break
          }
        }
      }
      if (found) this.setContact(this.contact)
      // else {
      //   console.log("todo: notif to chats page and chats nav")
      // }
    }
  }

  handleGetMessage = (msg:any) => {
    console.log(msg)
    if (this.contact){
      let m = msg as Messages
      let found = false
      for (const key in this.contact) {
        if (this.contact.hasOwnProperty(key)) {
          if (this.contact[key].datas.room.name === m.target!.name){
            this.contact[key].datas.updated = new Date()

            if (this.currentUser.username === m.sender!.username){
              //disable load old msg
              if (m.messages && m.messages.length < MessageLimit) this.contact[key].datas.page =-1
              else this.contact[key].datas.page += 1

              for(let i = 0; i < m.messages.length;i++){
                let newMsg = {
                  id:m.messages[i].id, 
                  action:m.messages[i].action,
                  message:m.messages[i].message,
                  sender:{
                    avatar: m.messages[i].sender === this.currentUser.username? this.currentUser.avatar : this.contact[m.messages[i].sender].avatar,
                    name: m.messages[i].sender === this.currentUser.username? this.currentUser.name : this.contact[m.messages[i].sender].name,
                    username: m.messages[i].sender === this.currentUser.username? this.currentUser.username : this.contact[m.messages[i].sender].username,
                  },
                  status: m.messages[i].status,
                  target:m.target,
                  time: m.messages[i].time,
                } as Message

                let alreadyExist = false
                for(let j = 0; j < this.contact[key].datas.messages.length; j++){
                  if (this.contact[key].datas.messages[j].time === newMsg.time){
                    if (!this.contact[key].datas.messages[j].id){
                      this.contact[key].datas.messages[j] = newMsg
                      alreadyExist = true
                    }
                    else{
                      if (this.contact[key].datas.messages[j].id === newMsg.id){
                        this.contact[key].datas.messages[j] = newMsg
                        alreadyExist = true
                      }
                    }
                  }
                }

                if (!alreadyExist) this.contact[key].datas.messages.unshift(newMsg)
              }
            }
            this.updateMessagePage(key,this.contact[key].name,this.contact[key].datas.wsStatus)
            break
          }
        }
      }
      if (found) this.setContact(this.contact)
    }
  }

  handleDelivered = (msg:any) => {
    console.log(msg)
    this.updateChatPage()
    if (this.contact){
      let m = msg as Messages
      for (const key in this.contact) {
        if (this.contact.hasOwnProperty(key)) {
          if (this.contact[key].datas.room.id === m.target!.id){
            this.contact[key].datas.updated = new Date()

            for(let i =0; i< this.contact[key].datas.messages.length; i++){
              for(let j =0; j< m.messages.length; j++)
              if (this.contact[key].datas.messages[i].time === m.messages[j].time){
                this.contact[key].datas.messages[i].id = m.messages[j].id
                this.contact[key].datas.messages[i].status = "delv"
              }
            }

            this.updateMessagePage(key,this.contact[key].name,this.contact[key].datas.wsStatus)
            break
          }
        }
      }
    }
  }

  handleHasBeenRead = (msg:any) => {
    console.log(msg)
    this.updateChatPage()
    if (this.contact){
      let m = msg as Message
      for (const key in this.contact) {
        if (this.contact.hasOwnProperty(key)) {
          if (this.contact[key].datas.room.id === m.target!.id){
            this.contact[key].datas.updated = new Date()

            for(let i = this.contact[key].datas.messages.length -1; i>= 0; i--){
              if (this.contact[key].datas.messages[i].id 
                && this.contact[key].datas.messages[i].id.length > 0 
                && this.contact[key].datas.messages[i].id === m.message
              ){
                this.contact[key].datas.messages[i].id = m.message
                this.contact[key].datas.messages[i].status = "read"
              }
            }
            this.updateMessagePage(key,this.contact[key].name,this.contact[key].datas.wsStatus)
            break
          }
        }
      }
    }
  }

  handleInfo = (msg:any) => {
    console.log(msg)
    if (msg.status === "error"){
      let act: string[] = msg.message.split(",");
      if (act[0] === 'join-room-private'){
        if (msg.sender.username && msg.sender.avatar !== 'join-room-private' && this.contact[msg.sender.username]){
          if (this.contact[msg.sender.username].datas.firstLoad){
            let sender = msg.sender as TargetUser
            this.contact[msg.sender.username].avatar = sender.avatar
            this.contact[msg.sender.username].contact = sender.contact
            this.contact[msg.sender.username].name = sender.name
            this.contact[msg.sender.username].username = sender.username
            if (msg.target){
              this.notify("get-msg",{
                action: 'get-msg',
                message: "1,"+MessageLimit,
                target: {
                  id: msg.target.id,
                  name: msg.target.name
                }
              } as Message)
            }
          }
          this.contact[msg.sender.username].datas.wsStatus = msg.message !== "" ? act[1]: this.contact[msg.sender.username].datas.wsStatus
          this.contact[msg.sender.username].datas.updated = new Date()
          this.contact[msg.sender.username].datas.room = msg.target as Room
          this.contact[msg.sender.username].datas.isFriend = false

          this.setContact(this.contact)
          this.updateMessagePage(msg.sender.username,msg.sender.name,this.contact[msg.sender.username].datas.wsStatus)
        }
      }
    }
  }

  onWebsocketOpen = () => {
    console.log("connected to WS!")
    this.setCurrentReconnectDelay(initialReconnectDelay)
    this.setIsWsConnected(true)
  }

  onWebsocketClose = (ev:Event) => {
    console.log("diconnected from WS!")
    this.setIsWsConnected(false)

    setTimeout(() => {
      if (this.currentReconnectDelay < maxReconnectDelay) {
        this.currentReconnectDelay = this.currentReconnectDelay*2
      }
      if (this.currentReconnectDelay > 1000*64){
        this.setCurrentReconnectDelay(1000*64)
      }
      this.reconnectWs()
    }, this.currentReconnectDelay + Math.floor(Math.random() * 3000));
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

  notify(method: string, params: any): void {
    this.socket.send(JSON.stringify(new JsonRPC2(method,params)));
  }
}

export default JsonRPCSignal