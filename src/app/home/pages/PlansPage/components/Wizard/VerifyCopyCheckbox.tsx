import React from 'react';
import { Checkbox } from '@patternfly/react-core';
import { IPlanPersistentVolume } from '../../../../../plan/duck/types';
import { VerifyWarningState } from './VerifyCopyWarningModal';
import { useFormikContext } from 'formik';
import { IFormValues } from './WizardContainer';

interface IVerifyCopyCheckboxProps {
  verifyWarningState: VerifyWarningState;
  setVerifyWarningState: (value: React.SetStateAction<VerifyWarningState>) => void;
  pv: IPlanPersistentVolume;
  currentPV: IPlanPersistentVolume;
}

export const VerifyCopyCheckbox: React.FunctionComponent<IVerifyCopyCheckboxProps> = ({
  verifyWarningState,
  setVerifyWarningState,
  pv,
  currentPV,
}: IVerifyCopyCheckboxProps) => {
  const { values, setFieldValue } = useFormikContext<IFormValues>();

  const isVerifyCopyAllowed = pv.selection.copyMethod === 'filesystem';

  const onVerifyFlagChange = (currentPV: IPlanPersistentVolume, value: boolean) => {
    const updatedAssignment = {
      ...values.pvVerifyFlagAssignment,
      [currentPV.name]: value,
    };
    setFieldValue('pvVerifyFlagAssignment', updatedAssignment);
  };

  return (
    <Checkbox
      isChecked={isVerifyCopyAllowed && values.pvVerifyFlagAssignment[pv.name]}
      isDisabled={!isVerifyCopyAllowed}
      onChange={(checked) => {
        onVerifyFlagChange(currentPV, checked);
        if (checked && verifyWarningState === 'Unread') {
          setVerifyWarningState('Open');
        }
      }}
      aria-label={`Verify copy for PV ${pv.name}`}
      id={`verify-pv-${pv.name}`}
      name={`verify-pv-${pv.name}`}
    />
  );
};
