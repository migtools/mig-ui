import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Card, CardBody, Title } from '@patternfly/react-core';

class AuthErrorComponent extends React.Component<any> {
  componentDidMount() {
    if (!this.props.authError) {
      this.props.routeHome();
    }
  }

  render() {
    return (
      <Card>
        {this.props.authError && (
          <CardBody>
            <Title headingLevel="h3">Authentication Error</Title>
            {this.props.authError}
          </CardBody>
        )}
      </Card>
    );
  }
}

export default connect(
  (state) => ({
    authError: state.auth.authError,
  }),
  (dispatch) => ({
    routeHome: () => dispatch(push('/')),
  })
)(AuthErrorComponent);
