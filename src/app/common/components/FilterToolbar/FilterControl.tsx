import React, { useState } from 'react';
import {
  Select,
  SelectOption,
  InputGroup,
  TextInput,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import { IFilterCategory, FilterValue, FilterType } from './FilterToolbar';

interface IFilterControlProps {
  category: IFilterCategory;
  value: FilterValue;
  setValue: (newValue: FilterValue) => void;
}

export const FilterControl: React.FunctionComponent<IFilterControlProps> = ({
  category,
  value,
  setValue,
}) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const onFilterSelect = () => console.log('onFilterSelect');

  // TODO split into sub components?

  const [inputValue, setInputValue] = useState('');
  const onInputSubmit = () => console.log('onInputSubmit');
  const onInputChange = () => console.log('onInputChange');

  const onInputKeyDown = () => {
    onInputSubmit();
    console.log('onInputKeyDown');
  };

  if (category.type === FilterType.select) {
    return (
      <Select
        aria-label={category.title}
        onToggle={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
        onSelect={onFilterSelect} // TODO ???
        selections={value}
        isExpanded={isFilterDropdownOpen}
        placeholderText="Any"
      >
        {category.selectOptions.map(optionProps => (
          <SelectOption {...optionProps} />
        ))}
      </Select>
    );
  }
  if (category.type === FilterType.search) {
    const id = `${category.key}-input`;
    return (
      <InputGroup>
        {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
        <TextInput
          name={id}
          id={id}
          type="search"
          aria-label={`${category.title} filter`}
          onChange={onInputChange}
          value={inputValue}
          placeholder={category.placeholderText}
          onKeyDown={onInputKeyDown}
        />
        <Button
          variant={ButtonVariant.control}
          aria-label="search button for search input"
          onClick={onInputSubmit}
        >
          <SearchIcon />
        </Button>
      </InputGroup>
    );
  }
  return null;
};
