import React, { useEffect } from 'react';

const RedirectToLogin: React.FunctionComponent<{}> = () => {
  useEffect(() => {
    window.location.href = '/login';
  }, []);
  return null;
};

export default RedirectToLogin;
