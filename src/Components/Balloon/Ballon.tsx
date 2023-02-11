import React from 'react';
import './style.css';

type Props = React.PropsWithChildren<{
  isLeft:boolean;
}>;

const Balloon : React.FC<Props> = (props) => {
  if (typeof props.children === "string" && props.children) {
    const lines = (props.children! as string).split("\n");
    return (<>
      {
        props.isLeft ? <div className="bln blft">{lines.map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}</div> :
        <div className="bln brgt">{lines.map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}</div>
      }
    </>);
  }

  return (<>
    {
      props.isLeft ? <div className="bln blft">{props.children}</div> :
      <div className="bln brgt">{props.children}</div>
    }
  </>);
};

export default Balloon;
