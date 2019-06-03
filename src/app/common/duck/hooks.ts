import { useState } from 'react';
export { default as commonHooks } from './hooks';

export const useOpenModal = initialState => {
  const [isOpen, setOpen] = useState(initialState);

  const toggleOpen = () => {
    const openState = !isOpen;
    setOpen(openState);
  };

  return [isOpen, toggleOpen];
};
