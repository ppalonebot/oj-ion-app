interface user {
  uid:string;
  name:string;
  username:string;
  email:string;
  jwt:string;
  isregistered:boolean;
}

export class User implements user {
  uid: string;
  name: string;
  username: string;
  email: string;
  jwt: string;
  isregistered: boolean;

  constructor(uid: string, name: string, username: string, email: string, jwt: string, isregistered: boolean) {
    this.uid = uid;
    this.name = name;
    this.username = username;
    this.email = email;
    this.jwt = jwt;
    this.isregistered = isregistered;
  }

  save(): void {
    // Convert the object to a JSON string
    const userData = JSON.stringify(this);

    // Save the JSON string to local storage
    localStorage.setItem('userself', userData);
  }

  static load(): User | null {
    // Load the JSON string from local storage
    const userData = localStorage.getItem('userself');

    // Return null if there is no data in local storage
    if (!userData) {
      return null;
    }

    // Parse the JSON string and return a new User object
    return JSON.parse(userData) as User;
  }
}
