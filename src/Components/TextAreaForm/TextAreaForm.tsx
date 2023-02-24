import React from 'react';
import './style.css';
export interface ErrInput {
  field: string;
  error:string
}

type Props = {
  name : string;
  label?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  errorMessage?: string;
  placeholder?: string;
  className?: string;
  rows?:number;
  isNotResizeable? : boolean;
  onKeyDown?: (event : React.KeyboardEvent<HTMLTextAreaElement>) => void;
  myref?:React.RefObject<HTMLTextAreaElement>;
  onFocus?:(event: React.FocusEvent<HTMLTextAreaElement, Element>)=> void;
  onBlur?:(event: React.FocusEvent<HTMLTextAreaElement, Element>)=> void;
};

const TextAreaForm: React.FC<Props> = (props) => {
  return (
    <div className={"dark-theme-textarea "+(props.className? props.className:"mb-6")}>
      {props.label && <label className="block text-gray-200 text-sm font-bold mb-2">
        {props.label}:
      </label>}
      <textarea
        id={props.name}
        name={props.name}
        rows={props.rows??10}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        style={{resize: props.isNotResizeable? 'none' : 'both'}}
        onKeyDown={props.onKeyDown}
        ref={props.myref}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
      />
      {props.errorMessage && <p className='text-red-600 text-sm'>{props.errorMessage}</p>}
  </div>
  );
};

export default TextAreaForm;
