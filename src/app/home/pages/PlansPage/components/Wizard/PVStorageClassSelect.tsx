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

  const currentStorageClass = values.pvStorageClassAssignment[pv.name];

  const onStorageClassChange = (currentPV: IPlanPersistentVolume, value: string) => {
    const newSc = storageClasses.find((sc) => sc !== '' && sc.name === value) || '';
    const updatedAssignment = {
      ...values.pvStorageClassAssignment,
      [currentPV.name]: newSc,
    };
    setFieldValue('pvStorageClassAssignment', updatedAssignment);
  };

  const noneOption = { value: '', toString: () => 'None' };
  const storageClassOptions: OptionWithValue[] = [
    ...storageClasses.map((storageClass) => ({
      value: storageClass !== '' && storageClass.name,
      toString: () => targetStorageClassToString(storageClass),
    })),
    noneOption,
  ];

  return (
    <SimpleSelect
      id="select-storage-class"
      aria-label="Select storage class"
      className={styles.copySelectStyle}
      onChange={(option: any) => onStorageClassChange(currentPV, option.value)}
      options={storageClassOptions}
      value={
        currentStorageClass === ''
          ? noneOption
          : storageClassOptions.find(
              (option) => currentStorageClass && option.value === currentStorageClass.name
            ) || pv.storageClass
      }
      placeholderText="Select a storage class..."
    />
  );
};
