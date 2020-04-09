import React, { useState, useEffect } from 'react';
import {
  DataToolbarFilter,
  InputGroup,
  TextInput,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { IFilterControlProps } from './FilterControl';

const SearchFilterControl: React.FunctionComponent<IFilterControlProps> = ({
  category,
  filterValue,
  setFilterValue,
  showToolbarItem,
}: IFilterControlProps) => {
  // Keep internal copy of value until submitted by user
  const [inputValue, setInputValue] = useState((filterValue && filterValue[0]) || '');
  // Update it if it changes externally
  useEffect(() => {
    setInputValue((filterValue && filterValue[0]) || '');
  }, [filterValue]);

  const id = `${category.key}-input`;
  return (
    <DataToolbarFilter
      chips={filterValue || []}
      deleteChip={() => setFilterValue([])}
      categoryName={category.title}
      showToolbarItem={showToolbarItem}
    >
      <InputGroup>
        {/*
        // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
        <TextInput
          name={id}
          id={id}
          type="search"
          aria-label={`${category.title} filter`}
          onChange={setInputValue}
          value={inputValue}
          placeholder={category.placeholderText}
          onKeyDown={(event: React.KeyboardEvent) => {
            if (event.key && event.key !== 'Enter') return;
            setFilterValue([inputValue]);
          }}
        />
        <Button
          variant={ButtonVariant.control}
          aria-label="search button for search input"
          onClick={() => setFilterValue([inputValue])}
        >
          <SearchIcon />
        </Button>
      </InputGroup>
    </DataToolbarFilter>
  );
};

export default SearchFilterControl;
