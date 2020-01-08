import styled from '@emotion/styled';
import React from 'react';
import { Alert, AlertActionCloseButton, AlertProps } from '@patternfly/react-core';
import { AlertActions } from '../duck/actions';
import { connect } from 'react-redux';

const NotificationContainer = styled.div`
  position: fixed;
  z-index: 9999999;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  width: 25%;
`;

interface IProps {
  alertMessage: string;
  alertType: AlertProps['variant'];
  clearAlerts: () => null;
}

const AlertModal: React.FunctionComponent<IProps> = ({
  alertMessage,
  alertType,
  clearAlerts,
}) => {
  if (!alertMessage) { return null; }

  return (
    <NotificationContainer>
      <Alert
        variant={alertType}
        title={alertMessage}
        action={<AlertActionCloseButton onClose={clearAlerts} />}
      />
    </NotificationContainer>
  );
};

export default connect(
  null,
  dispatch => ({
    clearAlerts: () => dispatch(AlertActions.alertClear()),
  })
)(AlertModal);
