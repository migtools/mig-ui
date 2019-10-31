/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import Select from 'react-select';
import { Box, Flex, Text } from '@rebass/emotion';
import AWSForm from './ProviderForms/AWSForm';
import GCPForm from './ProviderForms/GCPForm';
import { css } from '@emotion/core';

interface IOtherProps {
  onAddEditSubmit: any;
  onClose: any;
  addEditStatus: any;
  initialStorageValues: any;
  checkConnection: (name) => void;
  currentStorage: any;
}

const AddEditStorageForm = (props: IOtherProps) => {
  const DynamicForm = ({ provider }) => {
    if (provider === null) {
      return (
        <Flex>
          <Box>
            <Text />
          </Box>
        </Flex>
      );
    } else {
      switch (provider.value) {
        case 'aws':
          return <AWSForm provider={provider.value} {...props} />;
        case 'gcp':
          return <GCPForm provider={provider.value} {...props} />;
        default:
          return null;
      }
    }
  };

  const [selectedProvider, setSelectedProvider] = useState(
    (props.initialStorageValues && props.initialStorageValues.provider) ? {
      label: props.initialStorageValues.provider,
      value: props.initialStorageValues.provider
    } : null
  );
  const [providerOptions, setproviderOptions] = useState([
    { label: 'aws', value: 'aws' },
    { label: 'gcp', value: 'gcp' },
    { label: 'azure', value: 'azure' }
  ]);


  const handleProviderChange = option => {
    setSelectedProvider(
      option
    );
  };
  return (
    <Flex flexDirection="column">
      <Box
        m="0 0 1em 0 "
        flex="auto"
        width={1 / 2}
        height={1}
        minHeight={11}
      >
        <Text css={css`
        font-weight: 550;
        font-size: 14px;
        margin-bottom: 5px;
        `}>
          Storage provider type
        </Text>
        <Select
          name="provider"
          onChange={handleProviderChange}
          options={providerOptions}
          value={selectedProvider}
          isDisabled={(props.initialStorageValues && props.initialStorageValues.provider) !== (null || undefined)}
        />
      </Box>
      <DynamicForm provider={selectedProvider} {...props} />
    </Flex>
  );
};
export default AddEditStorageForm;
