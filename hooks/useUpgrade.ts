import { useState } from "react";

const GUMROAD_URL = process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL ?? "#";

export function useUpgrade() {
  const [modalOpen, setModalOpen] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  const handleUpgrade = () => {
    // window.open must be called synchronously inside the click handler
    const tab = window.open(GUMROAD_URL, "_blank");
    setPopupBlocked(!tab || tab.closed);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPopupBlocked(false);
  };

  return { handleUpgrade, modalOpen, popupBlocked, closeModal };
}
