import { useState } from 'react';

export const useOpenModal = (initialState) => {
  const [isModalOpen, setModalOpen] = useState(initialState);

  const toggleModalOpen = () => {
    const modalOpenState = !isModalOpen;
    setModalOpen(modalOpenState);
  };

  return [isModalOpen, toggleModalOpen];
};
