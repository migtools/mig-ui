import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectOptionProps,
  SelectProps,
} from '@patternfly/react-core';
import React, { useState } from 'react';

import './SimpleSelect.css';

export interface OptionWithValue<T = string> extends SelectOptionObject {
  value: T;
  props?: Partial<SelectOptionProps>; // Extra props for <SelectOption>, e.g. children, className
}

export type OptionLike = string | SelectOptionObject | OptionWithValue;

export interface ISimpleSelectProps
  extends Omit<
    SelectProps,
    'onChange' | 'isExpanded' | 'onToggle' | 'onSelect' | 'selections' | 'value'
  > {
  onChange: (selection: OptionLike) => void;
  options: OptionLike[];
  value: OptionLike | OptionLike[];
}

const SimpleSelect: React.FunctionComponent<ISimpleSelectProps> = ({
  onChange,
  options,
  value,
  placeholderText = 'Select...',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Select
      placeholderText={placeholderText}
      isOpen={isOpen}
      onToggle={setIsOpen}
      onSelect={(event, selection: OptionLike) => {
        onChange(selection);
        setIsOpen(false);
      }}
      selections={value}
      toggleId={props.id}
      {...props}
    >
      {options.map((option) => (
        <SelectOption
          key={option.toString()}
          value={option}
          description={(option as OptionWithValue)?.props?.description}
          isDisabled={(option as OptionWithValue)?.props?.isDisabled}
          {...(typeof option === 'object' && (option as OptionWithValue).props)}
        />
      ))}
    </Select>
  );
};

export default SimpleSelect;
