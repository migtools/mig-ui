import React from 'react';
import { Alert, AlertActionCloseButton, AlertProps } from '@patternfly/react-core';
import { AlertActions } from '../duck/actions';
import { connect } from 'react-redux';
const styles = require('./AlertModal.module');

interface IProps {
  alertMessage: string;
  alertType: AlertProps['variant'];
  clearAlerts: () => null;
}

const AlertModal: React.FunctionComponent<IProps> = ({ alertMessage, alertType, clearAlerts }) => {
  if (!alertMessage) {
    return null;
  }

  return (
    <div className={styles.notiContainer}>
      <Alert
        variant={alertType}
        title={alertMessage}
        action={<AlertActionCloseButton onClose={clearAlerts} />}
      />
    </div>
  );
};

export default connect(null, (dispatch) => ({
  clearAlerts: () => dispatch(AlertActions.alertClear()),
}))(AlertModal);
