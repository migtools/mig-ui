import * as React from 'react';
const styles = require('./HideWrapper.module');

const HideWrapper = (props) => (
  <div {...props} className={styles.hideWrapper}>
    {props.children}
  </div>
);

export default HideWrapper;
