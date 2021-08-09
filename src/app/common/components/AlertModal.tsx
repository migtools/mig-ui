import React from 'react';
import { Alert, AlertActionCloseButton, AlertProps } from '@patternfly/react-core';
import { useDispatch, useSelector } from 'react-redux';
import { alertClear } from '../duck/slice';
const styles = require('./AlertModal.module').default;

interface IProps {
  alertMessage: string;
  alertType: AlertProps['variant'];
}

const AlertModal: React.FunctionComponent<IProps> = ({ alertMessage, alertType }) => {
  const dispatch = useDispatch();
  function isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }
  if (!alertMessage || isEmpty(alertMessage)) {
    return null;
  }

  return (
    <div className={styles.notiContainer}>
      <Alert
        variant={alertType}
        title={alertMessage}
        actionClose={<AlertActionCloseButton onClose={() => dispatch(alertClear())} />}
      />
    </div>
  );
};
export default AlertModal;
