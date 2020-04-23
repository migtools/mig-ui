import React, { useState } from 'react';
import {
  DataToolbarFilter,
  Select,
  SelectOption,
  SelectOptionObject,
} from '@patternfly/react-core';
import { IFilterControlProps } from './FilterControl';
import { ISelectFilterCategory } from './FilterToolbar';

export interface ISelectFilterControlProps extends IFilterControlProps {
  category: ISelectFilterCategory;
}

const SelectFilterControl: React.FunctionComponent<ISelectFilterControlProps> = ({
  category,
  filterValue,
  setFilterValue,
  showToolbarItem,
}: ISelectFilterControlProps) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const getOptionKeyFromOptionValue = (optionValue: string | SelectOptionObject) =>
    category.selectOptions.find((optionProps) => optionProps.value === optionValue).key;
  const getChipFromOptionValue = (optionValue: string | SelectOptionObject) =>
    optionValue.toString();
  const getOptionKeyFromChip = (chip: string) =>
    category.selectOptions.find((optionProps) => optionProps.value.toString() === chip).key;
  const getOptionValueFromOptionKey = (optionKey: string) =>
    category.selectOptions.find((optionProps) => optionProps.key === optionKey).value;

  const onFilterSelect = (value: string | SelectOptionObject) => {
    const optionKey = getOptionKeyFromOptionValue(value);
    // Currently this implements single-select, multiple-select is also a design option.
    // If we need multi-select filters in the future we can add that support here.
    // https://www.patternfly.org/v4/design-guidelines/usage-and-behavior/filters#attribute-value-textbox-filters
    setFilterValue([optionKey]);
    setIsFilterDropdownOpen(false);
  };
  const onFilterClear = (chip: string) => {
    const optionKey = getOptionKeyFromChip(chip);
    const newValue = filterValue ? filterValue.filter((val) => val !== optionKey) : [];
    setFilterValue(newValue.length > 0 ? newValue : null);
  };

  // Select expects "selections" to be an array of the "value" props from the relevant optionProps
  const selections = filterValue ? filterValue.map(getOptionValueFromOptionKey) : null;
  const chips = selections ? selections.map(getChipFromOptionValue) : [];

  return (
    <DataToolbarFilter
      chips={chips}
      deleteChip={(_, chip) => onFilterClear(chip as string)}
      categoryName={category.title}
      showToolbarItem={showToolbarItem}
    >
      <Select
        aria-label={category.title}
        onToggle={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
        selections={selections}
        onSelect={(_, value) => onFilterSelect(value)}
        isExpanded={isFilterDropdownOpen}
        placeholderText="Any"
      >
        {category.selectOptions.map((optionProps) => (
          <SelectOption {...optionProps} />
        ))}
      </Select>
    </DataToolbarFilter>
  );
};

export default SelectFilterControl;
