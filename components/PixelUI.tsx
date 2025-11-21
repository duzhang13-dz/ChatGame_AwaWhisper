import React from 'react';

interface PixelCardProps {
  children: React.ReactNode;
  className?: string;
}

export const PixelCard: React.FC<PixelCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative bg-[#e2e8f0] border-4 border-[#0f172a] shadow-[8px_8px_0px_0px_rgba(15,23,42,0.4)] p-4 ${className}`}>
      {/* Inner Border Detail */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-white opacity-20 pointer-events-none" />
      {children}
    </div>
  );
};

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const PixelButton: React.FC<PixelButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "font-bold py-2 px-4 border-b-4 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest";
  const primaryStyle = "bg-[#10b981] hover:bg-[#34d399] text-[#064e3b] border-[#064e3b] shadow-[0px_4px_0px_0px_#064e3b]";
  const secondaryStyle = "bg-[#94a3b8] hover:bg-[#cbd5e1] text-[#1e293b] border-[#475569] shadow-[0px_4px_0px_0px_#475569]";

  return (
    <button 
      className={`${baseStyle} ${variant === 'primary' ? primaryStyle : secondaryStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const TypewriterText: React.FC<{ text: string; speed?: number; onComplete?: () => void }> = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = React.useState('');
  
  React.useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return <span>{displayedText}</span>;
};