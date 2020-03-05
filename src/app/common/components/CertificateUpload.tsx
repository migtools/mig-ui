import React ,{useState, useRef} from 'react';
import {
  Button,
  InputGroup,
  TextInput,
  Form
} from '@patternfly/react-core';

interface ICertificateUploadProps {
  isDisabled: boolean;
  setFieldValue: any;
  onBlur: any;
  onInput: any;
  name: string;
}


const CertificateUpload: React.FunctionComponent<ICertificateUploadProps> = ({
  isDisabled, 
  onBlur, 
  onInput, 
  setFieldValue, 
  name
})=> {

  const [display, setDisplay] = useState('');


  const readFile = fileHandle => {
    // read the uploaded certificate and b64 encode it, then
    // save it to the bound form field.
    const reader = new FileReader();
    reader.onload = (event) => {
      const newValue = btoa(reader.result as string);

      setDisplay(fileHandle.name);
      setFieldValue(name, newValue);
    };
    reader.readAsBinaryString(fileHandle);
  };

  const handleChange = event => {
    if (event.target.files && event.target.files.length > 0) {
      readFile(event.target.files[0]);
    }
  };

  const fileInput = useRef(null);
  const clickFileInput = () =>{
    // redirect a click from any other part of the
    // component to the hidden file input in order
    // to open the browse dialog
    const fileInputCurrent = fileInput.current;
    if (fileInputCurrent) {
      fileInputCurrent.click();
    }
  }

  return (
    <InputGroup>
      <TextInput
        isReadOnly
        isDisabled={isDisabled}
        value={display}
        onClick={clickFileInput}
        id={name+'-selected-filename'}
      />
      <Button
        isDisabled={isDisabled}
        onClick={clickFileInput}
      >
            Browse
      </Button>
      <input
        ref={fileInput}
        type="file"
        id={name}
        name={name}
        style={{ display: 'none' }}
        onChange={handleChange}
        onInput={onInput}
        onBlur={onBlur}
      />
    </InputGroup>
  );
}
export default CertificateUpload;
