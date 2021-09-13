import { alertErrorModal } from './slice';

const DNS1123Validator = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
const URLValidator =
  /(http(s)?:\/\/.)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
const RouteHostValidator =
  /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

const IPValidator = (value: any) => {
  const blocks = value.split('.');
  return (
    blocks.length === 4 &&
    blocks
      .map((block: any, index: number) => {
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

export const isTimeoutError = (err: any) => {
  //TODO: We should do some type checking here. Have seen the toJSON() conversion fail. Maybe use stringify.
  const e = err.toJSON();
  return e.code && e.code === 206;
};

const testTargetNSName = (value: string) => {
  if (value?.length < 3 || value?.length > 63) {
    return 'The namespace name should be between 3 and 63 characters long.';
  } else if (!DNS1123Validator.test(value)) {
    return `Invalid character: "${value}". Name must be DNS-1123 label compliant, starting and ending
    with a lowercase alphanumeric character and containing only lowercase alphanumeric characters, "."
    or "-".`;
  }
  return '';
};

const DNS1123Error = (value: string) => {
  return `Invalid character: "${value}". Name must be DNS-1123 label compliant, starting and ending
    with a lowercase alphanumeric character and containing only lowercase alphanumeric characters, "."
    or "-".`;
};

const testDNS1123 = (value: string) => DNS1123Validator.test(value);

const testURL = (value: string) => URLValidator.test(value) || IPValidator(value);

const testRouteHost = (value: string) => RouteHostValidator.test(value);

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
  isTimeoutError,
  testURL,
  testRouteHost,
  capitalize,
  testTargetNSName,
};
