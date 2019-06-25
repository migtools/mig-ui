import React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

class CertErrorComponent extends React.Component<any> {
  componentDidMount() {
    if(!this.props.certError) {
      this.props.routeHome();
    }
  }

  render() {
    return (
      <div>
        {this.props.certError ?
          <div>
            A certificate error has occurred, please visit and accept the cert, 
            or correctly install your self-signed CA:
            <a href={this.props.certError.failedUrl}>  {this.props.certError.failedUrl}</a>
            <div />
            NOTE: The contents of the resulting page may report "unauthorized". 
            This is expected. After accepting the certificate, please reload the app.
          </div> : <div />
        }
      </div>
    );
  }
}

export default connect(
  state => ({
    certError: state.auth.certError,
  }),
  dispatch => ({
    routeHome: () => dispatch(push('/')),
  })
)(CertErrorComponent);
