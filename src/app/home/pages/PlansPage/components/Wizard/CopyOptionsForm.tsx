import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import { IFormValues, IOtherProps } from './WizardContainer';
import CopyOptionsTable from './CopyOptionsTable';
import { IPlanPersistentVolume } from '../../../../../plan/duck/types';
import { usePausedPollingEffect } from '../../../../../common/context';
import { useSelector } from 'react-redux';
import { DefaultRootState } from '../../../../../../configureStore';

const CopyOptionsForm: React.FunctionComponent = () => {
  const planState = useSelector((state: DefaultRootState) => state.plan);
  usePausedPollingEffect();
  const { setFieldValue, values } = useFormikContext<IFormValues>();

  const migPlanPvs = planState.currentPlan.spec.persistentVolumes;
  const storageClasses =
    (planState.currentPlan && planState.currentPlan.status.destStorageClasses) || [];

  useEffect(() => {
    if (!values.pvVerifyFlagAssignment || isEmpty(values.pvVerifyFlagAssignment)) {
      let pvVerifyFlagAssignment = {};
      if (migPlanPvs) {
        pvVerifyFlagAssignment = migPlanPvs.reduce(
          (assignedVerifyFlags, pv) => ({
            ...assignedVerifyFlags,
            [pv.name]: !!pv.selection.verify,
          }),
          {}
        );
      }
      setFieldValue('pvVerifyFlagAssignment', pvVerifyFlagAssignment);
    }
  }, []);

  const onStorageClassChange = (currentPV: IPlanPersistentVolume, value: string) => {
    const newSc = storageClasses.find((sc) => sc !== '' && sc.name === value) || '';
    const updatedAssignment = {
      ...values.pvStorageClassAssignment,
      [currentPV.name]: newSc,
    };
    setFieldValue('pvStorageClassAssignment', updatedAssignment);
  };

  const onVerifyFlagChange = (currentPV: IPlanPersistentVolume, value: boolean) => {
    const updatedAssignment = {
      ...values.pvVerifyFlagAssignment,
      [currentPV.name]: value,
    };
    setFieldValue('pvVerifyFlagAssignment', updatedAssignment);
  };

  return (
    <CopyOptionsTable
      storageClasses={storageClasses}
      onStorageClassChange={onStorageClassChange}
      onVerifyFlagChange={onVerifyFlagChange}
    />
  );
};
export default CopyOptionsForm;
