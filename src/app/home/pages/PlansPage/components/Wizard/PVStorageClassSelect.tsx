import { useFormikContext } from 'formik';
import React from 'react';
import SimpleSelect, { OptionWithValue } from '../../../../../common/components/SimpleSelect';
import { IMigPlanStorageClass, IPlanPersistentVolume } from '../../../../../plan/duck/types';
import { targetStorageClassToString } from '../../helpers';
import { IFormValues } from './WizardContainer';

const styles = require('./PVStorageClassSelect.module').default;

interface IPVStorageClassSelectProps {
  pv: IPlanPersistentVolume;
  currentPV: IPlanPersistentVolume;
  storageClasses: IMigPlanStorageClass[];
}

export const PVStorageClassSelect: React.FunctionComponent<IPVStorageClassSelectProps> = ({
  pv,
  currentPV,
  storageClasses,
}: IPVStorageClassSelectProps) => {
  const { values, setFieldValue } = useFormikContext<IFormValues>();
  currentPV = currentPV || pv;
  const currentStorageClass =
    values.pvStorageClassAssignment[currentPV?.name] || ({} as IMigPlanStorageClass);

  const onStorageClassChange = (currentPV: IPlanPersistentVolume, value: string) => {
    const newSc = storageClasses.find((sc) => sc.name === value) || '';
    const copy = JSON.parse(JSON.stringify(newSc));
    if (currentPV?.pvc.ownerType === 'VirtualMachine') {
      copy.volumeMode = 'auto';
      copy.accessMode = 'auto';
    } else {
      copy.volumeMode = currentStorageClass.volumeMode;
      copy.accessMode = currentStorageClass.accessMode;
    }
    const updatedAssignment = {
      ...values.pvStorageClassAssignment,
      [currentPV?.name]: copy,
    };
    setFieldValue('pvStorageClassAssignment', updatedAssignment);
  };

  const storageClassOptions: OptionWithValue[] = [
    ...storageClasses
      .filter(
        (storageClass) =>
          currentPV?.pvc.ownerType === 'VirtualMachine' ||
          (storageClass.volumeAccessModes.find(
            (vam) =>
              vam.volumeMode === currentPV?.pvc.volumeMode || currentPV?.pvc.volumeMode === 'auto'
          ) &&
            storageClass.volumeAccessModes.find(
              (vam) =>
                vam.accessModes.includes(currentPV?.pvc.accessModes[0]) ||
                currentPV?.pvc.accessModes[0] === 'auto'
            ))
      )
      .map((storageClass) => ({
        value: storageClass.name,
        toString: () => targetStorageClassToString(storageClass),
        props: { description: storageClass.provisioner },
      })),
  ];

  return (
    <SimpleSelect
      id="select-storage-class"
      aria-label="Select storage class"
      className={styles.copySelectStyle}
      onChange={(option: any) => onStorageClassChange(currentPV, option.value)}
      options={storageClassOptions}
      value={
        storageClassOptions.find(
          (option) => currentStorageClass && option.value === currentStorageClass.name
        ) || undefined
      }
      placeholderText="Select a storage class..."
    />
  );
};
