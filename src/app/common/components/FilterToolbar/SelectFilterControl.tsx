import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core';
import { IFilterControlProps } from './FilterControl';

const SelectFilterControl: React.FunctionComponent<IFilterControlProps> = ({
  category,
  filterValue,
  setFilterValue,
}: IFilterControlProps) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const getOptionKeyFromOptionValue = (optionValue: string | SelectOptionObject) =>
    category.selectOptions.find(optionProps => optionProps.value === optionValue).key;
  const getOptionValueFromOptionKey = (optionKey: string) =>
    category.selectOptions.find(optionProps => optionProps.key === optionKey).value;

  const onFilterSelect = (event: React.SyntheticEvent, value: string | SelectOptionObject) => {
    const optionKey = getOptionKeyFromOptionValue(value);
    // Currently this implements single-select, multiple-select is also a design option.
    // If we need multi-select filters in the future we can add that support here.
    // https://www.patternfly.org/v4/design-guidelines/usage-and-behavior/filters#attribute-value-textbox-filters
    setFilterValue([optionKey]);
    setIsFilterDropdownOpen(false);
  };

  // Select expects "selections" to be an array of the "value" props from the relevant optionProps
  const selections = filterValue ? filterValue.map(getOptionValueFromOptionKey) : null;

  return (
    <Select
      aria-label={category.title}
      onToggle={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
      selections={selections}
      onSelect={onFilterSelect}
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
