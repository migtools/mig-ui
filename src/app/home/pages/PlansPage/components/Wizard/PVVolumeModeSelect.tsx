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

interface IPVVolumeModeSelectProps {
  pv: IPlanPersistentVolume;
  currentPV: IPlanPersistentVolume;
  storageClasses: IMigPlanStorageClass[];
}

export const PVVolumeModeSelect: React.FunctionComponent<IPVVolumeModeSelectProps> = ({
  pv,
  currentPV,
  storageClasses,
}: IPVVolumeModeSelectProps) => {
  const { values, setFieldValue } = useFormikContext<IFormValues>();
  currentPV = currentPV || pv;

  const currentStorageClass =
    values.pvStorageClassAssignment[currentPV?.name] || ({} as IMigPlanStorageClass);
  const volumeAccessModes = currentStorageClass?.volumeAccessModes || [];

  const onVolumeModeChange = (currentPV: IPlanPersistentVolume, value: string) => {
    if (currentStorageClass) {
      currentStorageClass.volumeMode = value;
      const updatedAssignment = {
        ...values.pvStorageClassAssignment,
        [currentPV.name]: currentStorageClass,
      };
      setFieldValue('pvStorageClassAssignment', updatedAssignment);
    }
  };

  if (!volumeAccessModes) {
    return null;
  }
  const volumeModeOptions: OptionWithValue[] = [
    ...volumeAccessModes.map((volumeAccessMode: IVolumeAccessModes) => ({
      value: volumeAccessMode.volumeMode,
      toString: () => volumeAccessMode.volumeMode,
    })),
  ];
  if (currentPV.pvc.ownerType === 'VirtualMachine') {
    volumeModeOptions.splice(0, 0, { value: 'auto', toString: () => 'Auto' });
  }

  return (
    <SimpleSelect
      id="select-storage-class"
      aria-label="Select storage class"
      className={styles.copySelectStyle}
      onChange={(option: any) => onVolumeModeChange(currentPV, option.value)}
      options={volumeModeOptions}
      placeholderText="Select volume mode..."
      isDisabled={currentPV.pvc.ownerType !== 'VirtualMachine'}
      value={
        volumeModeOptions.find(
          (option) => currentStorageClass && option.value === currentStorageClass.volumeMode
        ) || volumeModeOptions[0]
      }
    />
  );
};
