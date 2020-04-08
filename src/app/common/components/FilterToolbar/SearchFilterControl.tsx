import React, { useState, useEffect } from 'react';
import { InputGroup, TextInput, Button, ButtonVariant } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { IFilterControlProps } from './FilterControl';

const SearchFilterControl: React.FunctionComponent<IFilterControlProps> = ({
  category,
  filterValue,
  setFilterValue,
}: IFilterControlProps) => {
  // Keep internal copy of value until submitted by user
  const [inputValue, setInputValue] = useState(filterValue);
  // Update it if it changes externally
  useEffect(() => {
    setInputValue(filterValue);
  }, [filterValue]);

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
        onChange={setInputValue}
        value={inputValue}
        placeholder={category.placeholderText}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key && event.key !== 'Enter') return;
          setFilterValue(inputValue);
        }}
      />
      <Button
        variant={ButtonVariant.control}
        aria-label="search button for search input"
        onClick={() => setFilterValue(inputValue)}
      >
        <SearchIcon />
      </Button>
    </InputGroup>
  );
};

export default SearchFilterControl;
