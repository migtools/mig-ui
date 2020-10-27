import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

class CertErrorComponent extends React.Component<any> {
  componentDidMount() {
    if (!this.props.certError) {
      this.props.routeHome();
    }
  }

  render() {
    return (
      <div>
        {this.props.certError ? (
          <div>
            A certificate error has occurred, likely caused by using self-signed CA certificates in
            one of the clusters. Navigate to the following URL and accept the certificate:
            <a href={this.props.certError.failedUrl}> {this.props.certError.failedUrl}</a>
            <div />
            If an "Unauthorized" message appears after you have accepted the certificate, refresh
            the web page.
            <div />
            To fix this issue permanently, add the certificate to your web browser's trust store.
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  }
}

export default connect(
  (state) => ({
    certError: state.auth.certError,
  }),
  (dispatch) => ({
    routeHome: () => dispatch(push('/')),
  })
)(CertErrorComponent);
