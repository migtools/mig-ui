import React, { useState } from 'react';
import { Select, SelectOption } from '@patternfly/react-core';

interface SimpleSelectProps {
  id: string;
  onChange: (selection: string) => void;
  options: string[];
  value: string;
}

// This can be used wherever we only need a simple select dropdown of strings.
// If we need complex values, this could be enhanced to support option objects with a toString property
const SimpleSelect: React.FunctionComponent<SimpleSelectProps> = ({ onChange, options, value }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Select
      id="sourceCluster"
      placeholderText="Select..."
      isExpanded={isExpanded}
      onToggle={setIsExpanded}
      onSelect={(event, selection: string) => {
        onChange(selection);
        setIsExpanded(false);
      }}
      selections={value}
    >
      {options.map(option => (
        <SelectOption key={option} value={option} />
      ))}
    </Select>
  );
};

export default SimpleSelect;
