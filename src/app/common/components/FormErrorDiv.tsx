import * as React from 'react';
const styles = require('./FormError.module')

const FormErrorDiv = (props) => (
  <div className={styles.formErrorDiv}>{props.children}</div>
);

export default FormErrorDiv;