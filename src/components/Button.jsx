const Button = ({ children, onClick, variant = 'primary', type = 'button', className = '', disabled = false }) => {
  const baseClasses = 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl relative overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-r from-orange to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/50',
    secondary: 'bg-gradient-to-r from-light-blue to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-500/50',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-red-500/50',
    outline: 'border-2 border-white/50 text-white hover:bg-white/20 bg-transparent backdrop-blur-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      {!disabled && (
        <span className="absolute inset-0 bg-white/20 transform scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left"></span>
      )}
    </button>
  );
};

export default Button;

