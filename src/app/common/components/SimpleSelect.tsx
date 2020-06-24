import React, { useState } from 'react';
import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectProps,
  Omit,
  SelectOptionProps,
} from '@patternfly/react-core';

export interface OptionWithValue<T = string> extends SelectOptionObject {
  value: T;
  props?: Partial<SelectOptionProps>; // Extra props for <SelectOption>, e.g. children, className
}

type OptionLike = string | SelectOptionObject | OptionWithValue;

interface SimpleSelectProps
  extends Omit<
    SelectProps,
    'onChange' | 'isExpanded' | 'onToggle' | 'onSelect' | 'selections' | 'value'
  > {
  onChange: (selection: OptionLike) => void;
  options: OptionLike[];
  value: OptionLike | OptionLike[];
  placeholderText?: string;
}

const SimpleSelect: React.FunctionComponent<SimpleSelectProps> = ({
  onChange,
  options,
  value,
  placeholderText = 'Select...',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Select
      placeholderText={placeholderText}
      isExpanded={isExpanded}
      onToggle={setIsExpanded}
      onSelect={(event, selection: OptionLike) => {
        onChange(selection);
        setIsExpanded(false);
      }}
      selections={value}
      {...props}
    >
      {options.map((option) => (
        <SelectOption
          key={option.toString()}
          value={option}
          {...(typeof option === 'object' && (option as OptionWithValue).props)}
        />
      ))}
    </Select>
  );
};

export default SimpleSelect;
