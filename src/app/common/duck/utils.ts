import { push } from 'connected-react-router';
import { ErrorCreators } from '../../auth/duck/errorActions';

const DNS1123Validator = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
const URLValidator =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

export const isSelfSignedCertError = (err) => {
  const e = err.toJSON();
  // HACK: Doing our best to determine whether or not the
  // error was produced due to a self signed cert error.
  // It's an extremely barren object.
  return !e.code && e.message === 'Network Error';
};

export const handleSelfSignedCertError = (failedUrl: string, dispatch: any) => {
  dispatch(ErrorCreators.certErrorOccurred(failedUrl));
  dispatch(push('/cert-error'));
};


const DNS1123Error = value => {
  return `Invalid value: "${value}" for a DNS-1123 subdomain with regex' +
    '"[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*"`;
};

const testDNS1123 = value => DNS1123Validator.test(value);

const testURL = value => URLValidator.test(value);

export default {
  testDNS1123,
  DNS1123Error,
  isSelfSignedCertError,
  handleSelfSignedCertError,
  testURL,
};
