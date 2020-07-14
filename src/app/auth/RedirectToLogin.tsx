import React, { useEffect } from 'react';

const RedirectToLogin: React.FunctionComponent<{}> = () => {
  useEffect(() => {
    // react-router Redirect wouldn't work here because /login is not a client-side route
    window.location.href = '/login';
  }, []);
  return null;
};

export default RedirectToLogin;
