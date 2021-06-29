import { useState } from 'react';

export const useToggleLoading = (initialState: boolean) => {
  const [isLoading, setLoading] = useState(initialState);

  const toggleLoading = () => {
    const loadingState = !isLoading;
    setLoading(loadingState);
  };

  return [isLoading, toggleLoading];
};
