import React, { useState } from 'react';
import { FileUpload } from '@patternfly/react-core';

interface ICertificateUploadProps {
  isDisabled?: boolean;
  onInput: (event: React.FormEvent<HTMLDivElement>) => void;
  fieldName: string;
  onChange: (value: string) => void;
  value: string;
}

const CertificateUpload: React.FunctionComponent<ICertificateUploadProps> = ({
  isDisabled,
  onInput,
  fieldName,
  onChange,
  value,
}) => {
  const [filename, setFilename] = useState('');

  return (
    <FileUpload
      id={`${fieldName}-file-upload`}
      type="text"
      value={value}
      filename={filename}
      onChange={(value: string, filename: string) => {
        onChange(value);
        setFilename(filename);
      }}
      isDisabled={isDisabled}
      aria-label="Upload CA bundle"
      onInput={onInput}
    />
  );
};

export default CertificateUpload;
