import React, { useState } from 'react';
import { Select, SelectOption, SelectProps, Omit } from '@patternfly/react-core';

interface SimpleSelectProps
  extends Omit<SelectProps, 'onChange' | 'isExpanded' | 'onToggle' | 'onSelect' | 'selections'> {
  id: string;
  onChange: (selection: string) => void;
  options: string[];
  value: string;
  placeholderText?: string;
}

// This can be used wherever we only need a simple select dropdown of strings.
// If we need complex values, this could be enhanced to support option objects with a toString property
const SimpleSelect: React.FunctionComponent<SimpleSelectProps> = ({
  id,
  onChange,
  options,
  value,
  placeholderText = 'Select...',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Select
      id={id}
      placeholderText={placeholderText}
      isExpanded={isExpanded}
      onToggle={setIsExpanded}
      onSelect={(event, selection: string) => {
        onChange(selection);
        setIsExpanded(false);
      }}
      selections={value}
      {...props}
    >
      {options.map(option => (
        <SelectOption key={option} value={option} />
      ))}
    </Select>
  );
};

export default SimpleSelect;
