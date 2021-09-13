import React from 'react';
import { Alert, AlertActionCloseButton, AlertProps } from '@patternfly/react-core';
import { useDispatch } from 'react-redux';
import { alertClear } from '../../duck/slice';
import { usePausedPollingEffect } from '../../context';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

interface IProps {
  alertMessage: string;
}

const GlobalAlert: React.FunctionComponent<IProps> = ({ alertMessage }) => {
  const dispatch = useDispatch();
  function isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }
  if (!alertMessage || isEmpty(alertMessage)) {
    return null;
  }
  usePausedPollingEffect();

  return (
    <Alert
      className={spacing.mtSm}
      variant="danger"
      title="Error"
      actionClose={<AlertActionCloseButton onClose={() => dispatch(alertClear())} />}
    >
      {alertMessage}
    </Alert>
  );
};
export default GlobalAlert;
