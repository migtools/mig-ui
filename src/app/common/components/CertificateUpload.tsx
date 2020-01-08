import React from 'react';
import { render } from 'react-dom';
import {
  Button,
  InputGroup,
  TextInput
} from '@patternfly/react-core';

type CertificateUploadProps = {
  isDisabled: boolean,
  onBlur: any,
  onChange: any,
  onInput: any,
  name: string,
}

type CertificateUploadState = {
  display: string,
}

class CertificateUpload extends React.Component<CertificateUploadProps, CertificateUploadState> {

  private fileInput = React.createRef<HTMLInputElement>()

  constructor(props) {
    super(props);
    this.clickFileInput = this.clickFileInput.bind(this);
    this.state = {
      display: '',
    }
  }

  clickFileInput() {
    // redirect a click from any other part of the
    // component to the hidden file input in order
    // to open the browse dialog
    const fileInput = this.fileInput.current;
    if (fileInput) {
      fileInput.click();
    }
  }

  readFile = fileHandle => {
    // read the uploaded certificate and b64 encode it, then
    // save it to the bound form field.
    const reader = new FileReader();
    reader.onload = (event) => {
      var newValue = btoa(reader.result as string);
      this.setState({ display: fileHandle.name });
      this.props.onChange(this.props.name, newValue);
    }
    reader.readAsBinaryString(fileHandle);
  };

  onChange = event => {
    if (event.target.files && event.target.files.length > 0) {
      this.readFile(event.target.files[0]);
    }
  };

  render() {
    return (
      <InputGroup>
        <TextInput
          isReadOnly
          isDisabled={this.props.isDisabled}
          value={this.state.display}
          onClick={this.clickFileInput}
          id={this.props.name+"-selected-filename"}
        />
        <Button
          isDisabled={this.props.isDisabled}
          onClick={this.clickFileInput}
        >
          Browse
        </Button>
        <input
          ref={this.fileInput}
          type="file"
          id={this.props.name}
          name={this.props.name}
          style={{ display: "none" }}
          onChange={this.onChange}
          onInput={this.props.onInput}
          onBlur={this.props.onBlur}
        />
      </InputGroup>
    );
  }
}
export default CertificateUpload;
