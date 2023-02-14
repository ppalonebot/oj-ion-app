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
  page:number;
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