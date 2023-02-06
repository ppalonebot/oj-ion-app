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
}