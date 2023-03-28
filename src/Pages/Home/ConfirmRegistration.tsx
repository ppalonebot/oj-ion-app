import { useEffect, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import MyDialog from '../../Components/MyDialog';
import { JsonRPC2 } from '../../lib/MyJsonRPC2';
import { User } from '../../Entity/User/User_model';
import { API_URL } from '../../global';
import Countdown from '../../Components/Countdown';


interface ConfirmRegCode {
  jwt  : string;
	uid  : string;
	code : string;
}

type Props = {
  user:User;
  onValid: (user:User) => void;
}

const ConfirmRegistration: React.FC<Props> = (props) => {
  const searchParams = new URLSearchParams(window.location.search);
  const countInit = parseInt(searchParams.get('c')??"3");

  const [digits, setDigits]  = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isKeyDownProcessed, setIsKeyDownProcessed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('Hello!');
  const [dialogTitle, setDialogTitle] = useState('A Title');

  const mutationResult = useMutation(
  (rpc : JsonRPC2) => fetch(API_URL+'/usr/rpc', {//fetch(process.env.PUBLIC_URL+'/usr/rpc', {
    method: 'POST',
    body: JSON.stringify(rpc),
    credentials: 'include', //must included
    headers: { 
      'Content-Type': 'application/json', 
      'credentials': 'true' //must included
    }
  }).then(res => {
    return res.json()
  }),
  {
    onSuccess: (data,v ,ctx) => {
      console.log(v)
      // Do something after the mutation is successful, such as showing a success message or redirecting the user
      console.log(data)
      if (data.result !== null){
        let s = new User(data.result.uid, data.result.name, data.result.username,data.result.email,data.result.jwt,data.result.isregistered)
        props.onValid(s)
      }
      else{
        setIsDialogOpen(true)
        setDialogTitle("Error "+data.error.code)
        setDialogMessage(data.error.message)
        setDigits(['', '', '', '', '', ''])
      }
    },
    onError: (error, v, ctx) => {
      // Do something after the mutation fails, such as showing an error message
      console.log(error)
      setIsDialogOpen(true)
      setDialogTitle("Info")
      setDialogMessage("Server Busy")
      setDigits(['', '', '', '', '', ''])
    }
  }
);
  const confirmReg = mutationResult.mutate;
  const status = mutationResult.status;

  const mutationResendCode = useMutation(
    (rpc : JsonRPC2) => fetch(API_URL+'/usr/rpc', {//fetch(process.env.PUBLIC_URL+'/usr/rpc', {
      method: 'POST',
      body: JSON.stringify(rpc),
      credentials: 'include', //must included
      headers: { 
        'Content-Type': 'application/json'
      }
    }).then(res => {
      return res.json()
    }),
    {
      onSuccess: (data,v ,ctx) => {
        console.log(v)
        // Do something after the mutation is successful, such as showing a success message or redirecting the user
        console.log(data)
        if (data.result !== null){
          console.log("resend code success")
        }
        else{
          setIsDialogOpen(true)
          setDialogTitle("Resend Registration Code Error")
          setDialogMessage(data.error.message)
        }
      },
      onError: (error, v, ctx) => {
        // Do something after the mutation fails, such as showing an error message
        console.log(error)
        setIsDialogOpen(true)
        setDialogTitle("Info")
        setDialogMessage("Server Busy")
      }
    }
  );
  const resendCode = mutationResendCode.mutate;

  const toggleDialog = () => {
    setIsDialogOpen(prevState => !prevState);
  }

  const resendRegEmail = () =>{
    let rpc : JsonRPC2 = new JsonRPC2("ResendCode",{uid:props.user.uid})
    resendCode(rpc);
  }
  
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (!isKeyDownProcessed) {
      setIsKeyDownProcessed(true);

      const { key } = event;

      if (key === "Backspace" || key === "Delete") {
        event.preventDefault();
        const newInputValues = [...digits];
        newInputValues[index] = "";
        setDigits(newInputValues);

        if (key === "Backspace" && index > 0) {
          inputRefs.current[index - 1]?.focus();
        // } else if (key === "Delete" && index < inputRefs.current.length - 1) {
        //   inputRefs.current[index + 1]?.focus();
        }
      } else if (key.length === 1 && /^[0-9]$/.test(key)) {
        event.preventDefault();
        const newInputValues = [...digits];
        newInputValues[index] = key;
        setDigits(newInputValues);

        if (index < inputRefs.current.length - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    }
  };

  const handleKeyUp = () => {
    setIsKeyDownProcessed(false);

    if (digits.every((digit) => digit)) {
      const r: ConfirmRegCode = { uid: props.user.uid, jwt: props.user.jwt, code: digits.join("") };
      const rpc: JsonRPC2 = new JsonRPC2("ConfirmRegistration", r);
      confirmReg(rpc);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!(event.target.value.length  >= 6 && index === 0)) return

    const newDigits = [...digits];
    let start = 0;
  
    while (index < 6 && start < event.target.value.length) {
      newDigits[index] = event.target.value[start];
      start += 1;
      index += 1;
    }
  
    setDigits(newDigits);
  
    // if (event.target.value.length === 1) {
    //   const nextInput = event.target.nextSibling as HTMLInputElement;
    //   if (nextInput && event.target.value) {
    //     nextInput.focus();
    //   }
    // }
  
    // if (newDigits.every((digit) => digit)) {
    //   const r: ConfirmRegCode = { uid: props.user.uid, jwt: props.user.jwt, code: newDigits.join("") };
    //   const rpc: JsonRPC2 = new JsonRPC2("ConfirmRegistration", r);
    //   confirmReg(rpc);
    // }
  }
  
  return (
    <div className="p-4 w-full h-full flex flex-col justify-start items-center">
      <MyDialog title={dialogTitle} isDialogOpen={isDialogOpen} toggleDialog={toggleDialog}>
        <p>{dialogMessage}</p>
      </MyDialog>
      <h1 className="text-2xl font-bold text-center mt-12 mb-6">Confirm Registration</h1>
      <form className="mx-auto max-w-lg flex justify-center">
        {digits.map((digit, index) => (
          <input
            disabled={status === "loading"}
            key={index}
            type="text"
            value={digit}
            maxLength={index === 0? 6 : 1}
            ref={(input) => {
              inputRefs.current[index] = input;
            }}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onKeyUp={handleKeyUp}
            onChange={(event) => handleChange(event, index)}
            className="shadow appearance-none border rounded w-10 h-10 text-gray-700 text-center font-bold text-xl leading-tight focus:outline-none focus:shadow-outline mr-2"
          />
        ))}
      </form>
      {status === "loading" && <p>Loading...</p>}
      {status === "error" && <p>Error: {"Server Error!"}</p>}
      <div className="mt-8">
        <Countdown onResend={resendRegEmail} countInit={countInit} />
      </div>
    </div>
  );
  
};

export default ConfirmRegistration;
