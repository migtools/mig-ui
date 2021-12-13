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

  return <CopyOptionsTable storageClasses={storageClasses} />;
};
export default CopyOptionsForm;
