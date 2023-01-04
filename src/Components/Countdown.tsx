import React, { useState, useEffect } from 'react';

type Props = {
  countInit?: number;
  onResend: () => void;
}

const countValue : number = 50; //seconds

const Countdown: React.FC<Props> = (props) => {
  const [countdown, setCountdown] = useState(props.countInit??countValue);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 0) {
          clearInterval(countdownInterval);
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [countdown]);

  const resend = () =>{
    setCountdown(countValue)
    props.onResend()
  }

  return (
    <p>
      Didn't get the email?
      <button disabled={countdown > 0} className={(countdown > 0 ? (countdown === 1 ? "text-yellow-400" : "text-red-600") : "text-green-400") +" m-2"} onClick={resend}>
        Resend {countdown > 0 && "("+countdown+" seconds)"}
      </button>
    </p>
   
  );
};

export default Countdown;
