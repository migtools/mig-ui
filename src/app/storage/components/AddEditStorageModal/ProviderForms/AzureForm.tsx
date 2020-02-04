import React, { useState } from 'react';
import { Flex, Box } from '@rebass/emotion';
import {
    Button,
    TextInput,
    Form,
    FormGroup,
    Tooltip,
    TooltipPosition,
    TextArea,
    Modal
} from '@patternfly/react-core';
import FormErrorDiv from '../../../../common/components/FormErrorDiv';
import {
    AddEditMode,
    addEditStatusText,
    addEditButtonText,
    isAddEditButtonDisabled,
    isCheckConnectionButtonDisabled,
} from '../../../../common/add_edit_state';
import ConnectionStatusLabel from '../../../../common/components/ConnectionStatusLabel';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { withFormik, FormikProps } from 'formik';
import utils from '../../../../common/duck/utils';

/* 
This URL is swapped out with downstream build scripts to point to the downstream documentation reference
*/
const CREDENTIAL_DOCUMENTATION_URL = 'https://github.com/fusor/mig-operator/blob/master/docs/usage/ObjectStorage.md#azure-object-storage';

const componentTypeStr = 'Repository';
const currentStatusFn = addEditStatusText(componentTypeStr);
const addEditButtonTextFn = addEditButtonText(componentTypeStr);

const valuesHaveUpdate = (values, currentStorage) => {
    if (!currentStorage) { return true; }

    const existingMigStorageName = currentStorage.MigStorage.metadata.name;
    const existingAzureStorageAccount = currentStorage.MigStorage.spec.backupStorageConfig.azureStorageAccount;
    const existingAzureResourceGroup = currentStorage.MigStorage.spec.backupStorageConfig.azureResourceGroup;

    let existingAzureBlob;
    if (currentStorage.Secret.data['azure-credentials']) {
        existingAzureBlob = atob(currentStorage.Secret.data['azure-credentials']);
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
    checkConnection: (name) => void;
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
        checkConnection,
        values,
        touched,
        errors,
        handleChange,
        setFieldTouched,
        onClose,
        handleSubmit,
        handleBlur

    } = props;
    const nameKey = 'name';
    const azureResourceGroupKey = 'azureResourceGroup';
    const azureStorageAccountKey = 'azureStorageAccount';
    const azureBlobKey = 'azureBlob';

    const formikHandleChange = (_val, e) => handleChange(e);
    const formikSetFieldTouched = key => () => setFieldTouched(key, true, true);

    return (
        <Form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
            <FormGroup label="Repository name" isRequired fieldId={nameKey}>
                <TextInput
                    onChange={formikHandleChange}
                    onInput={formikSetFieldTouched(nameKey)}
                    onBlur={handleBlur}
                    value={values.name}
                    name={nameKey}
                    type="text"
                    id="storage-name-input"
                    isDisabled={currentStatus.mode === AddEditMode.Edit}
                />
                {errors.name && touched.name && (
                    <FormErrorDiv id="feedback-name">{errors.name}</FormErrorDiv>
                )}
            </FormGroup>
            <FormGroup label="Azure resource group" isRequired fieldId={azureResourceGroupKey}>
                <TextInput
                    onChange={formikHandleChange}
                    onInput={formikSetFieldTouched(azureResourceGroupKey)}
                    onBlur={handleBlur}
                    value={values.azureResourceGroup}
                    name={azureResourceGroupKey}
                    type="text"
                    id="azure-resource-group-input"
                />
                {errors.azureResourceGroup && touched.azureResourceGroup && (
                    <FormErrorDiv id="azure-resource-group-input-error">{errors.azureResourceGroup}</FormErrorDiv>
                )}
            </FormGroup>
            <FormGroup label="Azure storage account name" isRequired fieldId={azureStorageAccountKey}>
                <TextInput
                    onChange={formikHandleChange}
                    onInput={formikSetFieldTouched(azureStorageAccountKey)}
                    onBlur={handleBlur}
                    value={values.azureStorageAccount}
                    name={azureStorageAccountKey}
                    type="text"
                    id="azure-storage-input"
                />
                {errors.azureStorageAccount && touched.azureStorageAccount && (
                    <FormErrorDiv id="azure-storage-input-error">{errors.azureStorageAccount}</FormErrorDiv>
                )}
            </FormGroup>
            <FormGroup
                label="Azure credentials (Copy and paste .INI file contents here)"
                isRequired
                fieldId={azureBlobKey}
            >
                <TextArea
                    onChange={formikHandleChange}
                    onInput={formikSetFieldTouched(azureBlobKey)}
                    onBlur={handleBlur}
                    value={values.azureBlob}
                    name={azureBlobKey}
                    type="text"
                    id="storage-blob-input"
                />
                {errors.azureBlob && touched.azureBlob && (
                    <FormErrorDiv id="feedback-access-key">{errors.azureBlob}</FormErrorDiv>
                )}
            </FormGroup>
            <Flex flexDirection="column">
                <Box m="0 0 1em 0 ">
                    <Button
                        type="submit"
                        isDisabled={isAddEditButtonDisabled(
                            currentStatus, errors, touched, valuesHaveUpdate(values, currentStorage)
                        )}
                        style={{ marginRight: '10px' }}
                    >
                        {addEditButtonTextFn(currentStatus)}
                    </Button>
                    <Tooltip
                        position={TooltipPosition.top}
                        content={<div>
                            Add or edit your storage details
            </div>}>
                        <span className="pf-c-icon">
                            <OutlinedQuestionCircleIcon />
                        </span>
                    </Tooltip>
                    <Button
                        style={{ marginLeft: '10px', marginRight: '10px' }}
                        isDisabled={isCheckConnectionButtonDisabled(
                            currentStatus, valuesHaveUpdate(values, currentStorage),
                        )}
                        onClick={() => checkConnection(values.name)}
                    >
                        Check Connection
          </Button>
                    <Tooltip
                        position={TooltipPosition.top}
                        content={<div>
                            Re-check your storage connection state
            </div>}><OutlinedQuestionCircleIcon />
                    </Tooltip>
                </Box>
                <Box m="0 0 1em 0 ">
                    <ConnectionStatusLabel
                        status={currentStatus}
                        statusText={currentStatusFn(currentStatus)}
                    />
                </Box>
                <Box m="auto 0 0 0 ">
                    <Button variant="primary" onClick={onClose}>
                        Close
          </Button>
                </Box>
            </Flex>
            {isPopUpModalOpen &&
                <Modal
                    isSmall
                    title="Repository information required"
                    isOpen={isPopUpModalOpen}
                    onClose={handleModalToggle}
                    actions={[
                        <Button key="confirm" variant="primary" onClick={handleModalToggle}>
                            Close
                        </Button>,
                    ]}
                    isFooterLeftAligned
                >
                    <Flex flexDirection="column">
                        <Box my={1}>
                            <p>
                                To add an Azure repository, you will need the following information:
                        </p>

                        </Box>
                        <Box my={1}>
                            <ul>
                                <li>
                                    - Azure subscription ID
                                </li>
                                <li>
                                    - Azure storage account
                                </li>
                                <li>
                                    - Azure tenant ID
                                </li>
                                <li>
                                    - Azure client ID
                                </li>
                                <li>
                                    - Azure client secret
                                </li>
                                <li>
                                    - Azure resource group
                                </li>
                                <li>
                                    - Azure cloud name
                                </li>
                            </ul>

                        </Box>
                        <Box my={1}>
                            <p>
                                See the &nbsp;
                                <a
                                    href={CREDENTIAL_DOCUMENTATION_URL}
                                    target="_blank">
                                    product documentation
                                </a>
                                &nbsp;
                                instructions on how to create an .INI file that
                                includes this information.
                            </p>

                        </Box>
                    </Flex>
                </Modal>
            }
        </Form>

    );
};


// valuesHaveUpdate - returns true if the formik values hold values that differ
// from a matching existing replication repository. This is different from props.dirty, which returns
// true when the form values differ from the initial values. It's possible to have
// a storage object exist, but have no initial values (user adds new storage, then updates
// while keeping the modal open). props.dirty is not sufficient for this case.


const AzureForm: any = withFormik({
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
            errors.azureBlop = 'Required';
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


