import React from 'react';
import './style.css';

type Props = {
  name : string;
  label: string;
  type: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage: string;
  placeholder?: string;
};

const InputForm: React.FC<Props> = (props) => {
  return (
    <div className="mb-6 dark-theme-input">
      <label className="block text-gray-200 text-sm font-bold mb-2">
        {props.label}:
      </label>
      <input
        id={props.name}
        name={props.name}
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
      />
      <p className='text-red-600 text-sm'>{props.errorMessage}</p>
  </div>
  );
};

export default InputForm;
