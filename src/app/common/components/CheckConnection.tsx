/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import theme from '../../../theme';
import {
  Button,
  FormGroup,
} from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import ConnectionState from '../connection_state';
import StatusIcon from './StatusIcon';

interface IProps {
  connectionState: any;
  errors: any;
  touched: any;
  checkConnection: () => void;
}

const CheckConnection: React.FunctionComponent<IProps> = ({
  connectionState,
  checkConnection,
  errors,
  touched,
  ...props
}) => {

  const errorsObj = Object.entries(errors).length === 0 && errors.constructor === Object;
  const touchedObj = Object.entries(touched).length === 0 && touched.constructor === Object;

  return (
    <FormGroup
      fieldId="check-connection"
      id="check-connection"
    >
      <Flex width="100%" m="20px 10px 10px 0" flexDirection="column">
        <Box>
          <Flex flexDirection="column" >
            <Box alignSelf="flex-start">
              <Button
                key="check connection"
                variant="secondary"
                isDisabled={!errorsObj || touchedObj}
                onClick={() => checkConnection()}
              >
                Check connection
              </Button>
            </Box>
            <Box alignSelf="flex-start">
              {renderConnectionState(connectionState)}
            </Box>
          </Flex>

        </Box>
        <Box mt={30} alignSelf="flex-start">
          <Button
            variant="primary"
            type="submit"
            isDisabled={connectionState !== ConnectionState.Success}
            style={{ marginRight: '10px' }}
          >
            Add
          </Button>
          <Button
            key="cancel"
            variant="secondary"
            onClick={() => this.props.onHandleModalToggle(null)}
          >
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
      iconStatus = 'checking';
      break;
    case ConnectionState.Success:
      cxStateContents = 'Success!';
      iconStatus = 'success';
      break;
    case ConnectionState.Failed:
      cxStateContents = 'Failed!';
      iconStatus = 'failed';
      break;
  }

  return (
    <Flex m="10px 10px 10px 0">
      <Box>
        {cxStateContents}
        {' '}
        <StatusIcon status={iconStatus} />
      </Box>
    </Flex>
  );
}
