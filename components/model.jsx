const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed z-[999] top-0 left-0 w-full h-full flex items-center justify-center p-3">
      <div
        onClick={onClose}
        className="absolute top-0 left-0 w-full h-full inset-0 bg-black/30"
      />
      {children}
    </div>
  );
};
export default Modal;
