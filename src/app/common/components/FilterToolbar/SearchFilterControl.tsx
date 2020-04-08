import React, { useState } from 'react';
import { InputGroup, TextInput, Button, ButtonVariant } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { IFilterControlProps } from './FilterControl';

const SearchFilterControl: React.FunctionComponent<IFilterControlProps> = ({
  category,
  value,
  setValue,
}: IFilterControlProps) => {
  const [inputValue, setInputValue] = useState('');
  const onInputSubmit = () => console.log('onInputSubmit');
  const onInputChange = () => console.log('onInputChange');
  const onInputKeyDown = () => {
    onInputSubmit();
    console.log('onInputKeyDown');
  };

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
};

export default SearchFilterControl;
