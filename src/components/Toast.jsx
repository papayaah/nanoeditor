import { Check, X } from 'lucide-react';

export const Toast = ({ type, message }) => {
  if (!message) return null;
  
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? (
        <Check size={20} />
      ) : (
        <X size={20} />
      )}
      <span>{message}</span>
    </div>
  );
};
