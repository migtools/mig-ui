import { useFormikContext } from 'formik';
import React from 'react';
import SimpleSelect, { OptionWithValue } from '../../../../../common/components/SimpleSelect';
import {
  IMigPlanStorageClass,
  IPlanPersistentVolume,
  IVolumeAccessModes,
} from '../../../../../plan/duck/types';
import { IFormValues } from './WizardContainer';

const styles = require('./PVStorageClassSelect.module').default;

interface IPVAccessModeSelectProps {
  pv: IPlanPersistentVolume;
  currentPV: IPlanPersistentVolume;
  storageClasses: IMigPlanStorageClass[];
}

export const PVAccessModeSelect: React.FunctionComponent<IPVAccessModeSelectProps> = ({
  pv,
  currentPV,
  storageClasses,
}: IPVAccessModeSelectProps) => {
  const { values, setFieldValue } = useFormikContext<IFormValues>();
  currentPV = currentPV || pv;

  const currentStorageClass =
    values.pvStorageClassAssignment[currentPV?.name] || ({} as IMigPlanStorageClass);
  const volumeAccessModes = currentStorageClass?.volumeAccessModes || [];
  const currentVolumeMode = currentStorageClass?.volumeMode || 'auto';
  const possibleAccessModes = volumeAccessModes?.find(
    (volumeAccessMode: IVolumeAccessModes) => volumeAccessMode.volumeMode === currentVolumeMode
  ) || { accessModes: [] as string[] };

  const onAccessModeChange = (currentPV: IPlanPersistentVolume, value: string) => {
    currentStorageClass.accessMode = value;
    const updatedAssignment = {
      ...values.pvStorageClassAssignment,
      [currentPV.name]: currentStorageClass,
    };
    setFieldValue('pvStorageClassAssignment', updatedAssignment);
  };

  const accessModeOptions: OptionWithValue[] = [
    ...possibleAccessModes.accessModes.map((value: string) => ({
      value: value,
      toString: () => value,
    })),
  ];
  accessModeOptions.splice(1, 1); // remove ReadOnly option
  if (currentPV.pvc.ownerType === 'VirtualMachine') {
    accessModeOptions.splice(0, 0, { value: 'auto', toString: () => 'Auto' });
  }

  return (
    <SimpleSelect
      id="select-storage-class"
      aria-label="Select storage class"
      className={styles.copySelectStyle}
      onChange={(option: any) => onAccessModeChange(currentPV, option.value)}
      options={accessModeOptions}
      placeholderText="Select volume mode..."
      isDisabled={currentPV.pvc.ownerType !== 'VirtualMachine'}
      value={
        accessModeOptions.find(
          (option) => currentStorageClass && option.value === currentStorageClass.accessMode
        ) || accessModeOptions[0]
      }
    />
  );
};
