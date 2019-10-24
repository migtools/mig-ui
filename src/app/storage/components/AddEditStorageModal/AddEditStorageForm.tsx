/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import Select from 'react-select';
import { Box, Flex, Text } from '@rebass/emotion';
import AWSForm from './ProviderForms/AWSForm';




// export default AddEditStorageForm;
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
    console.log('provider', provider)
    if (provider === null) {
      return (
        <Flex>
          <Box>
            <Text>
              Please select a storage provider type.
            </Text>
          </Box>
        </Flex>
      );
    } else {
      switch (provider.value) {
        case 'aws':
          return <AWSForm provider={provider.value} {...props} />;
        default:
          return null;
      }
    }
  }

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerOptions, setproviderOptions] = useState([
    { label: 'aws', value: 'aws' },
    { label: 'gcp', value: 'gcp' },
    { label: 'azure', value: 'azure' }
  ]);


  // const handleSharedCredsChange = (checked, event) => {
  //   setFieldValue('isSharedCred', checked);
  //   setIsSharedCred(checked);
  // };

  const handleProviderChange = option => {
    // setFieldValue('volumeSnapshotProvider', option.value);
    setSelectedProvider(
      option
    );
    // setFieldTouched('volumeSnapshotProvider');
  };
  return (
    <Flex flexDirection="column">
      <Box
        m="0 0 1em 0 "
        flex="auto"
        width={1 / 2}
        height={1}
        minHeight={10}
      >
        <Select
          name="provider"
          onChange={handleProviderChange}
          options={providerOptions}
          value={selectedProvider}
        />
      </Box>
      <DynamicForm provider={selectedProvider} {...props} />
    </Flex>
  );
};
export default AddEditStorageForm;
