import React from 'react';
import {
  Form,
  FormGroup,
  TextInput,
  Radio,
  TextContent,
  Text,
  Button,
  Flex,
  FlexModifiers,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { FormikProps, withFormik, FormikBag } from 'formik';
import {
  IAddEditStatus,
  AddEditMode,
  addEditButtonText,
  isAddEditButtonDisabled,
} from '../../add_edit_state';
import SimpleSelect from '../SimpleSelect';
import utils from '../../duck/utils';

enum FieldKey {
  name = 'name',
  associatedClusterName = 'associatedClusterName',
  tokenType = 'tokenType',
  serviceAccountToken = 'serviceAccountToken',
}

enum TokenType {
  oAuth = 'oAuth',
  serviceAccount = 'serviceAccount',
}

interface ITokenFormValues {
  [FieldKey.name]: string;
  [FieldKey.associatedClusterName]: string;
  [FieldKey.tokenType]: TokenType;
  [FieldKey.serviceAccountToken]: string;
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

  const onLogInClick = () => {
    // NATODO
    alert('NATODO: not yet implemented');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup
        label="Name"
        isRequired
        fieldId={FieldKey.name}
        helperTextInvalid={touched.name && errors.name}
        isValid={!(touched.name && errors.name)}
      >
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(FieldKey.name)}
          onBlur={handleBlur}
          value={values.name}
          name={FieldKey.name}
          type="text"
          id={FieldKey.name}
          isDisabled={addEditStatus.mode === AddEditMode.Edit}
          isValid={!(touched.name && errors.name)}
        />
      </FormGroup>
      <FormGroup
        label="Associate with cluster"
        isRequired
        fieldId={FieldKey.associatedClusterName}
        helperTextInvalid={touched.associatedClusterName && errors.associatedClusterName}
        isValid={!(touched.associatedClusterName && errors.associatedClusterName)}
      >
        <SimpleSelect
          id={FieldKey.associatedClusterName}
          onChange={(selection) => setFieldValue(FieldKey.associatedClusterName, selection)}
          options={['foo', 'bar', 'baz']} // NATODO
          value={values.associatedClusterName}
          placeholderText="Select cluster..."
        />
      </FormGroup>
      <FormGroup
        label="Token type"
        isRequired
        fieldId={FieldKey.tokenType}
        helperTextInvalid={touched.tokenType && errors.tokenType}
        isValid={!(touched.tokenType && errors.tokenType)}
      >
        <Radio
          id={`${FieldKey.tokenType}-${TokenType.oAuth}`}
          name={FieldKey.tokenType}
          isChecked={values.tokenType === TokenType.oAuth}
          onChange={(checked) => {
            if (checked) setFieldValue(FieldKey.tokenType, TokenType.oAuth);
          }}
          label="OAuth"
        />
        <div className={`${spacing.mtMd} ${spacing.mbLg} ${spacing.mlLg}`}>
          <TextContent>
            <Text component="p">
              Log in to the cluster to automatically generate the token, or enter the token string
              in the field.
            </Text>
          </TextContent>
          <Button
            variant="secondary"
            className={spacing.mtSm}
            onClick={onLogInClick}
            isDisabled={values.tokenType !== TokenType.oAuth}
          >
            Log in
          </Button>
        </div>
        <Radio
          id={`${FieldKey.tokenType}-${TokenType.serviceAccount}`}
          name={FieldKey.tokenType}
          isChecked={values.tokenType === TokenType.serviceAccount}
          onChange={(checked) => {
            if (checked) setFieldValue(FieldKey.tokenType, TokenType.serviceAccount);
          }}
          label="Service account"
        />
        <FormGroup
          className={`${spacing.mtMd} ${spacing.mbLg} ${spacing.mlLg}`}
          fieldId={FieldKey.serviceAccountToken}
          isRequired={values.tokenType === TokenType.serviceAccount}
          helperText="Enter the token string."
          helperTextInvalid={touched.serviceAccountToken && errors.serviceAccountToken}
          isValid={!(touched.serviceAccountToken && errors.serviceAccountToken)}
        >
          <TextInput
            onChange={formikHandleChange}
            onInput={formikSetFieldTouched(FieldKey.serviceAccountToken)}
            onBlur={handleBlur}
            value={values.serviceAccountToken}
            name={FieldKey.serviceAccountToken}
            type="text"
            id={FieldKey.serviceAccountToken}
            isDisabled={values.tokenType !== TokenType.serviceAccount}
            isValid={!(touched.serviceAccountToken && errors.serviceAccountToken)}
          />
        </FormGroup>
      </FormGroup>
      <Flex breakpointMods={[{ modifier: FlexModifiers['space-items-md'] }]}>
        <Button
          variant="primary"
          type="submit"
          isDisabled={isAddEditButtonDisabled(addEditStatus, errors, touched, true)}
        >
          {addEditButtonText('token')(addEditStatus)}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Flex>
    </Form>
  );
};

const AddEditTokenForm = withFormik<IOtherProps, ITokenFormValues>({
  mapPropsToValues: () => ({
    // NATODO initialize here from existing token for editing?
    name: '',
    associatedClusterName: '',
    tokenType: TokenType.oAuth,
    serviceAccountToken: '',
  }),
  validate: (values: ITokenFormValues) => {
    const errors: { [key in FieldKey]?: string } = {};
    if (!values.name) {
      errors.name = 'Required';
    } else if (!utils.testDNS1123(values.name)) {
      errors.name = utils.DNS1123Error(values.name);
    }

    if (!values.associatedClusterName) {
      errors.associatedClusterName = 'Required';
    }

    if (values.tokenType === TokenType.serviceAccount && !values.serviceAccountToken) {
      errors.serviceAccountToken = 'Required';
    }

    // NATODO validate whether the OAuth login was completed

    return errors;
  },
  handleSubmit: (values: ITokenFormValues, formikBag: FormikBag<IOtherProps, ITokenFormValues>) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    formikBag.setSubmitting(false);
    formikBag.props.onAddEditSubmit(values);
  },
})(InnerAddEditTokenForm);

export default AddEditTokenForm;
