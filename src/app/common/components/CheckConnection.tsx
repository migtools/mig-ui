/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import { Button, FormGroup } from '@patternfly/react-core';
import { Flex, Box } from '@rebass/emotion';
import StatusIcon from './StatusIcon';
import Loader from 'react-loader-spinner';
import theme from '../../../theme';

interface IProps {
  connectionState: any;
  isCheckingConnection?: boolean;
  errors: any;
  touched: any;
  onItemSubmit: (values, mode) => void;
  onHandleModalToggle: () => void;
  mode: string;
  values: any;
}

const CheckConnection: React.FunctionComponent<IProps> = ({
  isCheckingConnection,
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
  // const displayMode =
  //   typeof mode === 'undefined' ? 'Add' : mode.charAt(0).toUpperCase() + mode.substring(1);

  return (
    <FormGroup fieldId="check-connection" id="check-connection">
      <Flex width="100%" m="20px 10px 10px 0" flexDirection="column">
        <Box>
          <Flex flexDirection="column">
            <Box alignSelf="flex-start">
              <Button
                key="check connection"
                variant="secondary"
                isDisabled={!errorsObj || touchedObj || connectionState.isReady !== null}
                onClick={() => onItemSubmit(values, mode)}
                id="check-connection-btn"
              >
                Check connection
              </Button>
            </Box>

            <Box alignSelf="flex-start">
              <Flex m="10px 10px 10px 0">
                {isCheckingConnection ? (
                  <Loader
                    type="RevolvingDot"
                    color={theme.colors.medGray3}
                    height="1em"
                    width="1em"
                    style={{ display: 'inline' }}
                  />
                ) : (
                  <Box>
                    {connectionState.status}
                    <StatusIcon isReady={connectionState.isReady} />
                  </Box>
                )}
              </Flex>
            </Box>
          </Flex>
        </Box>
        <Box mt={30} alignSelf="flex-start">
          <Button key="cancel" variant="secondary" onClick={() => onHandleModalToggle()}>
            Close
          </Button>
        </Box>
      </Flex>
    </FormGroup>
  );
};

export default CheckConnection;
