import React, { useState } from 'react';
import {
  Button,
  TextInput,
  Form,
  FormGroup,
  TextArea,
  Modal,
  Grid,
  GridItem,
  Flex,
} from '@patternfly/react-core';
import {
  AddEditMode,
  addEditStatusText,
  addEditButtonText,
  isAddEditButtonDisabled,
} from '../../../../../../common/add_edit_state';
import ConnectionStatusLabel from '../../../../../../common/components/ConnectionStatusLabel';
import { withFormik, FormikProps } from 'formik';
import utils from '../../../../../../common/duck/utils';
import { validatedState } from '../../../../../../common/helpers';
import { IStorage } from '../../../../../../storage/duck/types';

/*
This URL is swapped out with downstream build scripts to point to the downstream documentation reference
*/
const CREDENTIAL_DOCUMENTATION_URL =
  'https://github.com/konveyor/mig-operator/blob/master/docs/usage/ObjectStorage.md#azure-object-storage';

const componentTypeStr = 'Repository';
const currentStatusFn = addEditStatusText(componentTypeStr);
const addEditButtonTextFn = addEditButtonText(componentTypeStr);

const valuesHaveUpdate = (values: any, currentStorage: IStorage) => {
  if (!currentStorage) {
    return true;
  }

  const existingMigStorageName = currentStorage.MigStorage.metadata.name;
  const existingAzureStorageAccount =
    currentStorage.MigStorage.spec.backupStorageConfig.azureStorageAccount;
  const existingAzureResourceGroup =
    currentStorage.MigStorage.spec.backupStorageConfig.azureResourceGroup;

  let existingAzureBlob;
  if (currentStorage?.Secret?.data['azure-credentials']) {
    existingAzureBlob = atob(currentStorage?.Secret?.data['azure-credentials']);
  }

  const valuesUpdatedObject =
    values.name !== existingMigStorageName ||
    values.azureResourceGroup !== existingAzureResourceGroup ||
    values.azureStorageAccount !== existingAzureStorageAccount ||
    values.azureBlob !== existingAzureBlob;

  return valuesUpdatedObject;
};

interface IFormValues {
  name: string;
  bslProvider: string;
  azureResourceGroup: string;
  azureStorageAccount: string;
  azureBlob: any;
}
interface IOtherProps {
  onAddEditSubmit: any;
  onClose: any;
  addEditStatus: any;
  initialStorageValues: any;
  currentStorage: any;
  provider: string;
}

const InnerAzureForm = (props: IOtherProps & FormikProps<IFormValues>) => {
  const [isPopUpModalOpen, setIsPopUpModalOpen] = useState(true);

  const handleModalToggle = () => {
    setIsPopUpModalOpen(!isPopUpModalOpen);
  };

  const {
    addEditStatus: currentStatus,
    currentStorage,
    values,
    touched,
    errors,
    handleChange,
    setFieldTouched,
    onClose,
    handleSubmit,
    handleBlur,
  } = props;
  const nameKey = 'name';
  const azureResourceGroupKey = 'azureResourceGroup';
  const azureStorageAccountKey = 'azureStorageAccount';
  const azureBlobKey = 'azureBlob';

  const formikHandleChange = (_val: any, e: any) => handleChange(e);
  const formikSetFieldTouched = (key: any) => () => setFieldTouched(key, true, true);

  return (
    <Form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <FormGroup
        label="Repository name"
        isRequired
        fieldId={nameKey}
        helperTextInvalid={touched.name && errors.name}
        validated={validatedState(touched.name, errors.name)}
      >
        {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(nameKey)}
          onBlur={handleBlur}
          value={values.name}
          name={nameKey}
          type="text"
          id={nameKey}
          isDisabled={currentStatus.mode === AddEditMode.Edit}
          validated={validatedState(touched.name, errors.name)}
        />
      </FormGroup>
      <FormGroup
        label="Azure resource group"
        isRequired
        fieldId={azureResourceGroupKey}
        helperTextInvalid={touched.azureResourceGroup && errors.azureResourceGroup}
        validated={validatedState(touched.azureResourceGroup, errors.azureResourceGroup)}
      >
        {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(azureResourceGroupKey)}
          onBlur={handleBlur}
          value={values.azureResourceGroup}
          name={azureResourceGroupKey}
          type="text"
          id={azureResourceGroupKey}
          validated={validatedState(touched.azureResourceGroup, errors.azureResourceGroup)}
        />
      </FormGroup>
      <FormGroup
        label="Azure storage account name"
        isRequired
        fieldId={azureStorageAccountKey}
        helperTextInvalid={touched.azureStorageAccount && errors.azureStorageAccount}
        validated={validatedState(touched.azureStorageAccount, errors.azureStorageAccount)}
      >
        {/*
          // @ts-ignore issue: https://github.com/konveyor/mig-ui/issues/747 */}
        <TextInput
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(azureStorageAccountKey)}
          onBlur={handleBlur}
          value={values.azureStorageAccount}
          name={azureStorageAccountKey}
          type="text"
          id={azureStorageAccountKey}
          validated={validatedState(touched.azureStorageAccount, errors.azureStorageAccount)}
        />
      </FormGroup>
      <FormGroup
        label="Azure credentials (Copy and paste .INI file contents here)"
        isRequired
        fieldId={azureBlobKey}
        helperTextInvalid={touched.azureBlob && errors.azureBlob}
        validated={validatedState(touched.azureBlob, errors.azureBlob)}
      >
        <TextArea
          onChange={formikHandleChange}
          onInput={formikSetFieldTouched(azureBlobKey)}
          onBlur={handleBlur}
          value={values.azureBlob}
          name={azureBlobKey}
          type="text"
          id={azureBlobKey}
          validated={validatedState(touched.azureBlob, errors.azureBlob)}
        />
      </FormGroup>
      <Flex>
        <Button
          aria-label="Azure Storage Submit Form"
          variant="primary"
          type="submit"
          isDisabled={isAddEditButtonDisabled(
            currentStatus,
            errors,
            touched,
            valuesHaveUpdate(values, currentStorage)
          )}
        >
          {addEditButtonTextFn(currentStatus)}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Flex>
      <ConnectionStatusLabel status={currentStatus} statusText={currentStatusFn(currentStatus)} />
      {isPopUpModalOpen && (
        <Modal
          variant="small"
          title="Repository information required"
          isOpen={isPopUpModalOpen}
          onClose={handleModalToggle}
          actions={[
            <Button
              aria-label="Repository information"
              key="confirm"
              variant="primary"
              onClick={handleModalToggle}
            >
              Close
            </Button>,
          ]}
        >
          <Grid hasGutter>
            <GridItem>
              <p>To add an Azure repository, you will need the following information:</p>
            </GridItem>
            <GridItem>
              <ul>
                <li>- Azure subscription ID</li>
                <li>- Azure storage account</li>
                <li>- Azure tenant ID</li>
                <li>- Azure client ID</li>
                <li>- Azure client secret</li>
                <li>- Azure resource group</li>
                <li>- Azure cloud name</li>
              </ul>
            </GridItem>
            <GridItem>
              <p>
                See the &nbsp;
                <a href={CREDENTIAL_DOCUMENTATION_URL} target="_blank">
                  product documentation
                </a>
                &nbsp; instructions on how to create an .INI file that includes this information.
              </p>
            </GridItem>
          </Grid>
        </Modal>
      )}
    </Form>
  );
};

// valuesHaveUpdate - returns true if the formik values hold values that differ
// from a matching existing replication repository. This is different from props.dirty, which returns
// true when the form values differ from the initial values. It's possible to have
// a storage object exist, but have no initial values (user adds new storage, then updates
// while keeping the modal open). props.dirty is not sufficient for this case.

const AzureForm: any = withFormik<IOtherProps, IFormValues>({
  mapPropsToValues: ({ initialStorageValues, provider }) => {
    const values = {
      name: '',
      azureResourceGroup: '',
      azureStorageAccount: '',
      azureBlob: '',
      bslProvider: provider,
    };

    if (initialStorageValues) {
      values.name = initialStorageValues.name || '';
      values.azureResourceGroup = initialStorageValues.azureResourceGroup || '';
      values.azureStorageAccount = initialStorageValues.azureStorageAccount || '';
      values.azureBlob = initialStorageValues.azureBlob || '';
      values.bslProvider = initialStorageValues.bslProvider || provider;
    }

    return values;
  },

  validate: (values: any) => {
    const errors: any = {};

    if (!values.name) {
      errors.name = 'Required';
    } else if (!utils.testDNS1123(values.name)) {
      errors.name = utils.DNS1123Error(values.name);
    }

    if (!values.azureResourceGroup) {
      errors.azureResourceGroup = 'Required';
    }

    if (!values.azureStorageAccount) {
      errors.azureStorageAccount = 'Required';
    }

    if (!values.azureBlob) {
      errors.azureBlob = 'Required';
    }

    return errors;
  },

  handleSubmit: (values, formikBag: any) => {
    // Formik will set isSubmitting to true, so we need to flip this back off
    formikBag.setSubmitting(false);
    formikBag.props.onAddEditSubmit(values);
  },
})(InnerAzureForm);

export default AzureForm;
