import React from 'react';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';
import { FormikProps, withFormik, FormikBag } from 'formik';
import { IAddEditStatus, AddEditMode } from '../../add_edit_state';

enum FieldKey {
  name = 'name',
}

interface ITokenFormValues {
  [FieldKey.name]: string;
}

interface IOtherProps {
  addEditStatus: IAddEditStatus;
  onAddEditSubmit: (values: ITokenFormValues) => void;
  onClose: () => void;
}

const InnerAddEditTokenForm: React.FunctionComponent<
  IOtherProps & FormikProps<ITokenFormValues>
> = ({
  addEditStatus,
  values,
  touched,
  errors,
  handleSubmit,
  handleChange,
  handleBlur,
  setFieldTouched,
  setFieldValue,
  onClose,
}: IOtherProps & FormikProps<ITokenFormValues>) => {
  const formikHandleChange = (_val, e) => handleChange(e);
  const formikSetFieldTouched = (key: FieldKey) => () => setFieldTouched(key, true, true);

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup
        label="Name"
        isRequired
        fieldId={FieldKey.name}
        helperTextInvalid={touched.name && errors.name}
        isValid={!(touched.name && errors.name)}
      >
        {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(FieldKey.name)}
          onBlur={handleBlur}
          value={values.name}
          name={FieldKey.name}
          type="text"
          id="cluster-name-input"
          isDisabled={addEditStatus.mode === AddEditMode.Edit}
          isValid={!(touched.name && errors.name)}
        />
      </FormGroup>
    </Form>
  );
};

const AddEditTokenForm = withFormik<IOtherProps, ITokenFormValues>({
  mapPropsToValues: () => ({
    // NATODO initialize here from existing token for editing?
    name: '',
  }),
  validate: (values: ITokenFormValues) => ({}), // NATODO add validation logic
  handleSubmit: (values: ITokenFormValues, formikBag: FormikBag<IOtherProps, ITokenFormValues>) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    formikBag.setSubmitting(false);
    formikBag.props.onAddEditSubmit(values);
  },
})(InnerAddEditTokenForm);

export default AddEditTokenForm;
