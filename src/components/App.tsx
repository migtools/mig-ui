import * as React from 'react';

import '@patternfly/react-core/dist/styles/base.css';

export interface HelloProps {
  compiler: string;
  framework: string;
}

export const App = (props: HelloProps) => {
  return (
    <h1>Hello from {props.compiler} and {props.framework}!</h1>
  )
};
