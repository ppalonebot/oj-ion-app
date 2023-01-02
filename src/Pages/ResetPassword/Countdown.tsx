import React, { useState, useEffect } from 'react';

type Props = {
  countInit?: number;
  onResend: () => void;
}

const Countdown: React.FC<Props> = (props) => {
  const [countdown, setCountdown] = useState(props.countInit??60);

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
    setCountdown(60)
    props.onResend()
  }

  return (
    <p>
      Didn't get the Email?
      <button disabled={countdown > 0} className={`text-${countdown > 0 ? "red" : "blue"}-600 m-2`} onClick={resend}>
        Resend {countdown > 0 && "("+countdown+" seconds)"}
      </button>
    </p>
   
  );
};

export default Countdown;
