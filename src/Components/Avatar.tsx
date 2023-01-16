import React from "react";

type Props = {
  className?: string;
  src: string;
  alt : string
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const Avatar: React.FC<Props> = (props) => {
  const [visibleAva, setVisibleAva] = React.useState(true);
  
  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setVisibleAva(false);
    props.onError?.(event)
  }

  return(
    <>
    {visibleAva && <img className={props.className} src={props.src} alt={props.alt} onError={handleError}/>}
    {!visibleAva && <img className={props.className} src={process.env.PUBLIC_URL+'/default-avatar.jpg'} alt={props.alt}/>}
    </>
  )
}

export default Avatar