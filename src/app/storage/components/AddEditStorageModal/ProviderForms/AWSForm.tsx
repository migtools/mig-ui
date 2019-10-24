import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Flex, Box } from '@rebass/emotion';
import {
    Button,
    TextInput,
    Form,
    FormGroup,
    Tooltip,
    TooltipPosition,
    TextArea,
    Checkbox
} from '@patternfly/react-core';
import FormErrorDiv from '../../../../common/components/FormErrorDiv';
import KeyDisplayIcon from '../../../../common/components/KeyDisplayIcon';
import HideWrapper from '../../../../common/components/HideWrapper';
import {
    AddEditMode,
} from '../../../../common/add_edit_state';

interface IProps {
    match?: any;
}

const AWSForm: React.FunctionComponent<any> = ({
    addEditStatus: currentStatus,
    currentStorage,
    checkConnection,
    values,
    touched,
    errors,
    handleChange,
    setFieldTouched,
    setFieldValue,
    onClose,
    handleSubmit,
    handleBlur

}) => {
    const nameKey = 'name';
    const s3UrlKey = 's3Url';
    const bucketNameKey = 'bucketName';
    const bucketRegionKey = 'bucketRegion';
    const accessKeyKey = 'accessKey';
    const secretKey = 'secret';
    const vslConfigKey = 'vslConfig';
    const vslBlobKey = 'vslBlob';

    const [isAccessKeyHidden, setIsAccessKeyHidden] = useState(true);
    const [isSharedCred, setIsSharedCred] = useState(true);

    const handleAccessKeyHiddenToggle = e => {
        e.preventDefault();
        e.stopPropagation();
        setIsAccessKeyHidden(!isAccessKeyHidden);
    };
    const [isSecretHidden, setIsSecretHidden] = useState(true);
    const handleSecretHiddenToggle = e => {
        e.preventDefault();
        e.stopPropagation();
        setIsSecretHidden(!isSecretHidden);
    };

    const formikHandleChange = (_val, e) => handleChange(e);
    const formikSetFieldTouched = key => () => setFieldTouched(key, true, true);

    return (
        <React.Fragment>
            <FormGroup label="Repository Name" isRequired fieldId={nameKey}>
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
            <FormGroup label="S3 Bucket Name" isRequired fieldId={bucketNameKey}>
                <TextInput
                    onChange={formikHandleChange}
                    onInput={formikSetFieldTouched(bucketNameKey)}
                    onBlur={handleBlur}
                    value={values.bucketName}
                    name={bucketNameKey}
                    type="text"
                    id="storage-bucket-name-input"
                />
                {errors.bucketName && touched.bucketName && (
                    <FormErrorDiv id="feedback-bucket-name">{errors.bucketName}</FormErrorDiv>
                )}
            </FormGroup>
            <FormGroup label="S3 Bucket Region" fieldId={bucketRegionKey}>
                <TextInput
                    onChange={formikHandleChange}
                    onInput={formikSetFieldTouched(bucketRegionKey)}
                    onBlur={handleBlur}
                    value={values.bucketRegion}
                    name={bucketRegionKey}
                    type="text"
                    id="storage-bucket-region-input"
                />
                {errors.bucketRegion && touched.bucketRegion && (
                    <FormErrorDiv id="feedback-bucket-name">{errors.bucketName}</FormErrorDiv>
                )}
            </FormGroup>
            <FormGroup label="S3 Endpoint" fieldId={s3UrlKey}>
                <TextInput
                    onChange={formikHandleChange}
                    onInput={formikSetFieldTouched(s3UrlKey)}
                    onBlur={handleBlur}
                    value={values.s3Url}
                    name={s3UrlKey}
                    type="text"
                    id="storage-s3-url-input"
                />
                {errors.s3Url && touched.s3Url && (
                    <FormErrorDiv id="feedback-s3-url">{errors.s3Url}</FormErrorDiv>
                )}
            </FormGroup>
            <FormGroup label="S3 Provider Access Key" isRequired fieldId={accessKeyKey}>
                <HideWrapper onClick={handleAccessKeyHiddenToggle}>
                    <KeyDisplayIcon id="accessKeyIcon" isHidden={isAccessKeyHidden} />
                </HideWrapper>
                <TextInput
                    onChange={formikHandleChange}
                    onInput={formikSetFieldTouched(accessKeyKey)}
                    onBlur={handleBlur}
                    value={values.accessKey}
                    name={accessKeyKey}
                    type={isAccessKeyHidden ? 'password' : 'text'}
                    id="storage-access-key-input"
                />
                {errors.accessKey && touched.accessKey && (
                    <FormErrorDiv id="feedback-access-key">{errors.accessKey}</FormErrorDiv>
                )}
            </FormGroup>
            <FormGroup label="S3 Provider Secret Access Key" isRequired fieldId={secretKey}>
                <HideWrapper onClick={handleSecretHiddenToggle}>
                    <KeyDisplayIcon id="accessKeyIcon" isHidden={isSecretHidden} />
                </HideWrapper>
                <TextInput
                    onChange={formikHandleChange}
                    onInput={formikSetFieldTouched(secretKey)}
                    onBlur={handleBlur}
                    value={values.secret}
                    name={secretKey}
                    type={isSecretHidden ? 'password' : 'text'}
                    id="storage-secret-input"
                />
                {errors.secret && touched.secret && (
                    <FormErrorDiv id="feedback-secret-key">{errors.secret}</FormErrorDiv>
                )}
            </FormGroup>

        </React.Fragment>
    );
};

export default AWSForm;

/* <FormGroup label="VSL Provider Configuration" isRequired fieldId={vslConfigKey}>
  <Checkbox
    label="Use BSL credentials for VSL"
    isChecked={isSharedCred}
    // onChange={formikHandleChange}
    onChange={handleSharedCredsChange}
    aria-label="shared-creds-checkbox"
    id="shared-creds-checkbox"
    name="shared-creds-checkbox"
  />
  {!isSharedCred &&
    <Flex flexDirection="column">
      <Box
        m="0 0 1em 0 "
        flex="auto"
        width={1 / 2}
      >
        <Select
          name="provider"
          onChange={handleProviderChange}
          options={providerOptions}
          value={selectedProvider}
        />
      </Box>
      <Box
        m="0 0 1em 0 "
        flex="auto"
      >
        <TextArea
          value={values.vslBlob}
          onChange={formikHandleChange}
          aria-label="vsl-blob-text-area"
          onInput={formikSetFieldTouched(vslConfigKey)}
          onBlur={handleBlur}
          // value={values.secret}
          name={vslBlobKey}
          type={isSecretHidden ? 'password' : 'text'}
          id="storage-vsl-blob-input"

        />
        {errors.secret && touched.secret && (
          <FormErrorDiv id="feedback-secret-key">{errors.secret}</FormErrorDiv>
        )}
      </Box>
    </Flex>
  }

</FormGroup> */
