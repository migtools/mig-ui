import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

class CertErrorComponent extends React.Component<any> {
  componentDidMount() {
    if(!this.props.certError) {
      this.props.routeHome();
    }
  }

  /* tslint:disable */
  render() {
    return (
      <div>
        {this.props.certError ?
          <div>
            A certificate error has occurred, likely due to the usage of self
            signed certificates in one of the clusters. Please try to visit the failed url
            and accept the CA:
            <a href={this.props.certError.failedUrl}>  {this.props.certError.failedUrl}</a>
            <div />
            The correct way to address this is to install your self CA into your browser.
            <div />
            NOTE: The contents of the resulting page may report "unauthorized".
            This is expected. After accepting the certificate, please reload the app.
            <div />
            If you think you have accepted all the certs and this issue continues to persist,
            please ensure that you have configured CORS on all relevant clusters as outlined

            in the <a href="https://github.com/fusor/mig-operator#manual-cors-cross-origin-resource-sharing-configuration">installation documentation</a>.
          </div> : <div />
        }
      </div>
    );
  }
  /* tslint:enable */
}

export default connect(
  state => ({
    certError: state.auth.certError,
  }),
  dispatch => ({
    routeHome: () => dispatch(push('/')),
  })
)(CertErrorComponent);
