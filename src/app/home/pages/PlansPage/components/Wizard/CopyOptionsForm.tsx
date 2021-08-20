import React, { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { isEmpty } from 'lodash';
import { IFormValues, IOtherProps } from './WizardContainer';
import CopyOptionsTable from './CopyOptionsTable';
import { IPlanPersistentVolume } from '../../../../../plan/duck/types';
import { usePausedPollingEffect } from '../../../../../common/context';

type ICopyOptionsFormProps = Pick<IOtherProps, 'clusterList' | 'currentPlan' | 'isFetchingPVList'>;

const CopyOptionsForm: React.FunctionComponent<ICopyOptionsFormProps> = ({
  clusterList,
  currentPlan,
  isFetchingPVList,
}: ICopyOptionsFormProps) => {
  usePausedPollingEffect();
  const { setFieldValue, values } = useFormikContext<IFormValues>();

  const migPlanPvs = currentPlan.spec.persistentVolumes;
  const storageClasses = (currentPlan && currentPlan.status.destStorageClasses) || [];

  useEffect(() => {
    // Build a pv => assignedStorageClass table, defaulting to the controller suggestion
    if (!values.pvStorageClassAssignment || isEmpty(values.pvStorageClassAssignment)) {
      let pvStorageClassAssignment = {};
      if (migPlanPvs) {
        pvStorageClassAssignment = migPlanPvs.reduce((assignedScs, pv) => {
          const suggestedStorageClass = storageClasses.find(
            (sc) => (sc !== '' && sc.name) === pv.selection.storageClass
          );
          return {
            ...assignedScs,
            [pv.name]: suggestedStorageClass ? suggestedStorageClass : '',
          };
        }, {});
      }
      setFieldValue('pvStorageClassAssignment', pvStorageClassAssignment);
    }
    if (!values.pvCopyMethodAssignment || isEmpty(values.pvCopyMethodAssignment)) {
      let pvCopyMethodAssignment = {};
      if (migPlanPvs) {
        pvCopyMethodAssignment = migPlanPvs.reduce((assignedCms, pv) => {
          const supportedCopyMethods = pv.supported.copyMethods || [];
          const suggestedCopyMethod = supportedCopyMethods.find(
            (cm) => cm === pv.selection.copyMethod
          );
          return {
            ...assignedCms,
            [pv.name]: suggestedCopyMethod ? suggestedCopyMethod : supportedCopyMethods[0],
          };
        }, {});
      }
      setFieldValue('pvCopyMethodAssignment', pvCopyMethodAssignment);
    }
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

  const onCopyMethodChange = (currentPV: IPlanPersistentVolume, value: string) => {
    const newCm = currentPV.supported.copyMethods.find((cm) => cm === value);
    const updatedAssignment = {
      ...values.pvCopyMethodAssignment,
      [currentPV.name]: newCm,
    };
    setFieldValue('pvCopyMethodAssignment', updatedAssignment);
  };

  return (
    <CopyOptionsTable
      isFetchingPVList={isFetchingPVList}
      currentPlan={currentPlan}
      persistentVolumes={
        values.persistentVolumes.length
          ? values.persistentVolumes.filter((v) => v.selection.action === 'copy')
          : []
      }
      pvStorageClassAssignment={values.pvStorageClassAssignment}
      pvVerifyFlagAssignment={values.pvVerifyFlagAssignment}
      pvCopyMethodAssignment={values.pvCopyMethodAssignment}
      storageClasses={storageClasses}
      onStorageClassChange={onStorageClassChange}
      onVerifyFlagChange={onVerifyFlagChange}
      onCopyMethodChange={onCopyMethodChange}
    />
  );
};
export default CopyOptionsForm;
