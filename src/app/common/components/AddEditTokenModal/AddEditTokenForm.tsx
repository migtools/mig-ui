import React, { useState, useEffect, useRef } from 'react';
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
import shortid from 'shortid';
import {
  IAddEditStatus,
  AddEditMode,
  addEditButtonText,
  isAddEditButtonDisabled,
} from '../../add_edit_state';
import SimpleSelect from '../SimpleSelect';
import utils from '../../duck/utils';
import { ICluster } from '../../../cluster/duck/types';
import { ITokenFormValues, TokenFieldKey, TokenType } from '../../../token/duck/types';

interface IOtherProps {
  addEditStatus: IAddEditStatus;
  onAddEditSubmit: (values: ITokenFormValues) => void;
  clusterList: ICluster[];
  onClose: () => void;
  preSelectedClusterName?: string;
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
  clusterList,
  preSelectedClusterName,
}: IOtherProps & FormikProps<ITokenFormValues>) => {
  const formikHandleChange = (_val, e) => handleChange(e);
  const formikSetFieldTouched = (key: TokenFieldKey) => () => setFieldTouched(key, true, true);

  const [oAuthResponseCode, setOAuthResponseCode] = useState<string>(null);
  const loginAttemptIdRef = useRef<string>();
  const loginWindowRef = useRef<Window>();

  const onLogInClick = () => {
    const clusterLoginUrl = 'https://cam-oauth-testing-login.surge.sh/'; // NATODO use a real login page
    const attemptId = shortid.generate();
    loginAttemptIdRef.current = attemptId;
    setOAuthResponseCode(null);
    const searchParams = new URLSearchParams({ state: attemptId });
    const loginUrl = `${clusterLoginUrl}?${searchParams.toString()}`;
    const loginWindow = window.open(loginUrl, '_blank');
    loginWindow.focus();
    loginWindowRef.current = loginWindow;
  };

  const handleStorageChanged = () => {
    if (loginAttemptIdRef.current && loginWindowRef.current) {
      const authCode = window.localStorage.getItem(`oauth-code-${loginAttemptIdRef.current}`);
      if (authCode) {
        setOAuthResponseCode(authCode);
        loginWindowRef.current.close();
        window.localStorage.removeItem(`oauth-code-${loginAttemptIdRef.current}`);
        loginAttemptIdRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (preSelectedClusterName) {
      setFieldValue(TokenFieldKey.AssociatedClusterName, preSelectedClusterName);
    }
    window.addEventListener('storage', handleStorageChanged);
    return () => window.removeEventListener('storage', handleStorageChanged);
  }, []);

  const clusterNames = clusterList.map((c) => c.MigCluster.metadata.name);

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup
        label="Name"
        isRequired
        fieldId={TokenFieldKey.Name}
        helperTextInvalid={touched.name && errors.name}
        isValid={!(touched.name && errors.name)}
      >
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(TokenFieldKey.Name)}
          onBlur={handleBlur}
          value={values.name}
          name={TokenFieldKey.Name}
          type="text"
          id={TokenFieldKey.Name}
          isDisabled={addEditStatus.mode === AddEditMode.Edit}
          isValid={!(touched.name && errors.name)}
        />
      </FormGroup>
      <FormGroup
        label="Associate with cluster"
        isRequired
        fieldId={TokenFieldKey.AssociatedClusterName}
        helperTextInvalid={touched.associatedClusterName && errors.associatedClusterName}
        isValid={!(touched.associatedClusterName && errors.associatedClusterName)}
      >
        <SimpleSelect
          id={TokenFieldKey.AssociatedClusterName}
          onChange={(selection) => setFieldValue(TokenFieldKey.AssociatedClusterName, selection)}
          options={clusterNames}
          value={values.associatedClusterName}
          placeholderText="Select cluster..."
          isDisabled={!!preSelectedClusterName}
        />
      </FormGroup>
      <FormGroup
        label="Token type"
        isRequired
        fieldId={TokenFieldKey.TokenType}
        helperTextInvalid={touched.tokenType && errors.tokenType}
        isValid={!(touched.tokenType && errors.tokenType)}
      >
        <Radio
          id={`${TokenFieldKey.TokenType}-${TokenType.OAuth}`}
          name={TokenFieldKey.TokenType}
          isChecked={values.tokenType === TokenType.OAuth}
          onChange={(checked) => {
            if (checked) setFieldValue(TokenFieldKey.TokenType, TokenType.OAuth);
          }}
          label="OAuth"
        />
        <div className={`${spacing.mtMd} ${spacing.mbLg} ${spacing.mlLg}`}>
          <TextContent>
            <Text component="p">Log in to the cluster to automatically generate the token.</Text>
          </TextContent>
          <Button
            variant="secondary"
            className={spacing.mtSm}
            onClick={onLogInClick}
            isDisabled={values.tokenType !== TokenType.OAuth || !values.associatedClusterName}
          >
            Log in
          </Button>
          {oAuthResponseCode && (
            <div style={{ color: 'green' }}>
              <p>
                <strong>TODO: Handle this response code! {oAuthResponseCode}</strong>
              </p>
            </div>
          )}
        </div>
        <Radio
          id={`${TokenFieldKey.TokenType}-${TokenType.ServiceAccount}`}
          name={TokenFieldKey.TokenType}
          isChecked={values.tokenType === TokenType.ServiceAccount}
          onChange={(checked) => {
            if (checked) setFieldValue(TokenFieldKey.TokenType, TokenType.ServiceAccount);
          }}
          label="Service account"
        />
        <FormGroup
          className={`${spacing.mtMd} ${spacing.mbLg} ${spacing.mlLg}`}
          fieldId={TokenFieldKey.ServiceAccountToken}
          isRequired={values.tokenType === TokenType.ServiceAccount}
          helperText="Enter the token string."
          helperTextInvalid={touched.serviceAccountToken && errors.serviceAccountToken}
          isValid={!(touched.serviceAccountToken && errors.serviceAccountToken)}
        >
          <TextInput
            onChange={formikHandleChange}
            onInput={formikSetFieldTouched(TokenFieldKey.ServiceAccountToken)}
            onBlur={handleBlur}
            value={values.serviceAccountToken}
            name={TokenFieldKey.ServiceAccountToken}
            type="text"
            id={TokenFieldKey.ServiceAccountToken}
            isDisabled={values.tokenType !== TokenType.ServiceAccount}
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
    tokenType: TokenType.OAuth,
    serviceAccountToken: '',
  }),
  validate: (values: ITokenFormValues) => {
    const errors: { [key in TokenFieldKey]?: string } = {};
    if (!values.name) {
      errors.name = 'Required';
    } else if (!utils.testDNS1123(values.name)) {
      errors.name = utils.DNS1123Error(values.name);
    }

    if (!values.associatedClusterName) {
      errors.associatedClusterName = 'Required';
    }

    if (values.tokenType === TokenType.ServiceAccount && !values.serviceAccountToken) {
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
