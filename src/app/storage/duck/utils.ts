const validateIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

const testS3Name = (value: string) => {
  if (value.length < 3 || value.length > 63) {
    return 'The bucket name can be between 3 and 63 characters long.';
  } else if (!/^[-a-z0-9\.]+$/.test(value)) {
    return (
      'Each label in the bucket name must start with a lowercase letter or number.' +
      'The bucket name can contain only lower-case characters, numbers, periods, and dashes.'
    );
  } else if (validateIP.test(value)) {
    return 'The bucket name cannot be formatted as an IP address.';
  } else if (!/[a-z0-9]$/.test(value) || /[\.-][\.-]/.test(value)) {
    return (
      'The bucket name cannot contain underscores, end with a dash' +
      ', have consecutive periods, or use dashes adjacent to periods.'
    );
  }
  return '';
};

export default {
  testS3Name,
};
