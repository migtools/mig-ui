import React from 'react';
import { FormikProps } from 'formik';
import { IFormValues, IOtherProps } from './WizardContainer';
import StorageClassTable from './StorageClassTable';

interface IStorageClassFormProps
  extends Pick<IOtherProps, 'clusterList' | 'currentPlan' | 'isFetchingPVList'>,
    Pick<FormikProps<IFormValues>, 'setFieldValue' | 'values'> {}

const StorageClassForm: React.FunctionComponent<IStorageClassFormProps> = ({
  clusterList,
  currentPlan,
  isFetchingPVList,
  setFieldValue,
  values,
}: IStorageClassFormProps) => {
  return (
    <StorageClassTable
      isFetchingPVList={isFetchingPVList}
      setFieldValue={setFieldValue}
      values={values}
      currentPlan={currentPlan}
      clusterList={clusterList}
    />
  );
};
export default StorageClassForm;
