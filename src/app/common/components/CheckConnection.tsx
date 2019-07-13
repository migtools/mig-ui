/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import { Button, FormGroup } from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import ConnectionState from '../connection_state';
import StatusIcon from './StatusIcon';

interface IProps {
  connectionState: any;
  errors: any;
  touched: any;
  onItemSubmit: (values) => void;
  onHandleModalToggle: () => void;
  mode: string;
  values: any;
}

const CheckConnection: React.FunctionComponent<IProps> = ({
  connectionState,
  onItemSubmit,
  errors,
  touched,
  onHandleModalToggle,
  mode,
  values,
}) => {
  const errorsObj = Object.entries(errors).length === 0 && errors.constructor === Object;
  const touchedObj = Object.entries(touched).length === 0 && touched.constructor === Object;
  const displayMode =
    typeof mode === 'undefined' ? 'Add' : mode.charAt(0).toUpperCase() + mode.substring(1);

  return (
    <FormGroup fieldId="check-connection" id="check-connection">
      <Flex width="100%" m="20px 10px 10px 0" flexDirection="column">
        <Box>
          <Flex flexDirection="column">
            <Box alignSelf="flex-start">
              <Button
                key="check connection"
                variant="secondary"
                isDisabled={!errorsObj || touchedObj}
                onClick={() => onItemSubmit(values)}
                id="check-connection-btn"
              >
                Check connection
              </Button>
            </Box>
            <Box alignSelf="flex-start">{renderConnectionState(connectionState)}</Box>
          </Flex>
        </Box>
        <Box mt={30} alignSelf="flex-start">
          <Button
            variant="primary"
            type="submit"
            isDisabled={connectionState !== ConnectionState.Success}
            style={{ marginRight: '10px' }}
            id="submit-cluster-btn"
          >
            {displayMode}
          </Button>
          <Button key="cancel" variant="secondary" onClick={() => onHandleModalToggle()}>
            Cancel
          </Button>
        </Box>
      </Flex>
    </FormGroup>
  );
};

export default CheckConnection;

function renderConnectionState(connectionState: ConnectionState) {
  let cxStateContents;
  let iconStatus;

  switch (connectionState) {
    case ConnectionState.Checking:
      cxStateContents = 'Checking...';
      iconStatus = false;
      break;
    case ConnectionState.Success:
      cxStateContents = 'Success!';
      iconStatus = true;
      break;
    case ConnectionState.Failed:
      cxStateContents = 'Failed!';
      iconStatus = false;
      break;
  }

  return (
    <Flex m="10px 10px 10px 0">
      <Box>
        {cxStateContents} <StatusIcon isReady={iconStatus} />
      </Box>
    </Flex>
  );
}
