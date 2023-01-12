import React from 'react';
import './style.css';
export interface ErrInput {
  field: string;
  error:string
}

type Props = {
  name : string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  errorMessage: string;
  placeholder?: string;
};

const TextAreaForm: React.FC<Props> = (props) => {
  return (
    <div className="mb-6 dark-theme-textarea">
      <label className="block text-gray-200 text-sm font-bold mb-2">
        {props.label}:
      </label>
      <textarea
        id={props.name}
        name={props.name}
       
        rows={10}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
      />
      <p className='text-red-600 text-sm'>{props.errorMessage}</p>
  </div>
  );
};

export default TextAreaForm;
