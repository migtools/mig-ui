import { Checkbox } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import React from 'react';
import { IFormValues } from './WizardContainer';

const LiveMigrationForm: React.FunctionComponent = () => {
  const { handleBlur, setFieldTouched, handleChange, values } = useFormikContext<IFormValues>();
  const formikSetFieldTouched = (key: any) => () => setFieldTouched(key, true, true);
  const formikHandleChange = (_val: any, e: React.FormEvent<HTMLInputElement>) => handleChange(e);

  return (
    <Checkbox
      onChange={formikHandleChange}
      onInput={formikSetFieldTouched(values.liveMigrate)}
      onBlur={handleBlur}
      isChecked={values.liveMigrate}
      name={'liveMigrate'}
      label="At time of plan execution, storage live migrate any running Virtual Machines associated with the selected PVs. Note: The Virtual Machine will be live migrated to a different node, this requires at least 2 nodes."
      id="live-migrate"
    />
  );
};
export default LiveMigrationForm;
