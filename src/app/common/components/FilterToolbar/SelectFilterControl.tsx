import React, { useState } from 'react';
import { Select, SelectOption } from '@patternfly/react-core';
import { IFilterControlProps } from './FilterControl';

const SelectFilterControl: React.FunctionComponent<IFilterControlProps> = ({
  category,
  filterValue,
  setFilterValue,
}: IFilterControlProps) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const onFilterSelect = () => console.log('onFilterSelect');

  return (
    <Select
      aria-label={category.title}
      onToggle={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
      onSelect={onFilterSelect} // TODO ???
      selections={filterValue}
      isExpanded={isFilterDropdownOpen}
      placeholderText="Any"
    >
      {category.selectOptions.map(optionProps => (
        <SelectOption {...optionProps} />
      ))}
    </Select>
  );
};

export default SelectFilterControl;
