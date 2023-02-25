export type UserResult = {
  name:string;
  username:string;
  avatar:string;
  contact:Contact|null;
}

export type Contact = {
  owner: string;
  to: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TargetUser = {
  name : string;
  username : string;
  avatar : string;
  contact: Contact;
  datas:ContactData;
}

export type ContactData = {
  messages : Array<Message>;
  wsStatus: string;
  updated: Date;
  room: Room;
  scroll:number;
  height:number;
  page:number;
  newMsgCount:number;
  topMsgTimeId?:string;
  firstLoad?:boolean;
  isActive:boolean;
  isInputFocus?:boolean;
  inputMsg?:string;
  selectionStart?:number;
  selectionEnd?:number;
}

export type Room = {
  id: string;
  name:string;
  private:boolean;
}

export type Message = {
  id:string;
  action: string;
  message: string;
  target: Room | null;
  sender: TargetUser | null;
  status: string;
  time: string;
}

export type Messages = {
  action: string;
  messages: Array<any>;
  target: Room | null;
  sender: TargetUser | null;
  status: string;
  time: string;
}

export type LastMessages = {
  room_id: string;
  last_msg: Message;
  unread_c: number;
  private: true;
  sender: string;
  icon_image:string;
  icon_name:string;
  icon_at:string;
}