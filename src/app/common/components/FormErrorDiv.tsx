import * as React from 'react';
const styles = require('./FormError.module')

// TODO this should be removed in favor of using the `helperTextInvalid` and `isValid` props of `FormGroup`. 
const FormErrorDiv = (props) => (
  <div className={styles.formErrorDiv}>{props.children}</div>
);

export default FormErrorDiv;