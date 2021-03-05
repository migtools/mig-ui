import { push } from 'connected-react-router';
import { AuthActions } from '../../auth/duck/actions';

const DNS1123Validator = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
const URLValidator = /(http(s)?:\/\/.)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
const RouteHostValidator = /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

const IPValidator = (value) => {
  const blocks = value.split('.');
  return (
    blocks.length === 4 &&
    blocks
      .map((block, index) => {
        const ipValue = Number(block);
        if (index === 0) {
          return ipValue >= 1 && ipValue < 256;
        } else {
          return ipValue >= 0 && ipValue < 256;
        }
      })
      .every(Boolean)
  );
};

export const isSelfSignedCertError = (err) => {
  const e = err.toJSON();
  // HACK: Doing our best to determine whether or not the
  // error was produced due to a self signed cert error.
  // It's an extremely barren object.
  return !e.code && e.message === 'Network Error';
};

export const isTimeoutError = (err) => {
  //TODO: We should do some type checking here. Have seen the toJSON() conversion fail. Maybe use stringify.
  const e = err.toJSON();
  return e.code && e.code === 206;
};

export const handleSelfSignedCertError = (failedUrl: string, dispatch: any) => {
  dispatch(AuthActions.certErrorOccurred(failedUrl));
  dispatch(push('/cert-error'));
};

const DNS1123Error = (value) => {
  return `Invalid character: "${value}". Name must be DNS-1123 label compliant, starting and ending
    with a lowercase alphanumeric character and containing only lowercase alphanumeric characters, "."
    or "-".`;
};

const testDNS1123 = (value) => DNS1123Validator.test(value);

const testURL = (value) => URLValidator.test(value) || IPValidator(value);

const testRouteHost = (value) => RouteHostValidator.test(value);

export const capitalize = (s: string) => {
  if (s.charAt(0)) {
    return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
  } else {
    return s;
  }
};

export default {
  testDNS1123,
  DNS1123Error,
  isSelfSignedCertError,
  isTimeoutError,
  handleSelfSignedCertError,
  testURL,
  testRouteHost,
  capitalize,
};
