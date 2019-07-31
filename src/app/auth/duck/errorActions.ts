const certErrorOccurred = (failedUrl: string) =>
({
    type: ErrorTypes.CERT_ERROR_OCCURRED,
  failedUrl,
});

export const ErrorTypes = {
  CERT_ERROR_OCCURRED: 'CERT_ERROR_OCCURRED',
};

export const ErrorCreators = {
  certErrorOccurred,
};
