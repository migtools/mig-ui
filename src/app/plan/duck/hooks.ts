import { useState } from 'react';

export const useToggleLoading = initialState => {
  const [isLoading, setLoading] = useState(initialState);

  const toggleLoading = () => {
    const loadingState = !isLoading;
    setLoading(loadingState);
  };

  return [isLoading, toggleLoading];
};

export const useToggleValidation = initialState => {
  const [isValid, setValid] = useState(initialState);

  const toggleValid = () => {
    const validState = !isValid;
    setValid(validState);
  };

  return [isValid, toggleValid];
};
