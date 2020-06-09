import { useState } from 'react';

export const useOpenModal = (initialState: boolean): [boolean, () => void] => {
  const [isModalOpen, setModalOpen] = useState(initialState);

  const toggleModalOpen = () => setModalOpen(!isModalOpen);
  return [isModalOpen, toggleModalOpen];
};
