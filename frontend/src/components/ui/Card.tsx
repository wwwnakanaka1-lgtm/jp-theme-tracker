interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ title, children, className = '', onClick }: CardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`bg-gray-800 rounded-xl border border-gray-700 p-4 ${
        onClick ? 'hover:bg-gray-750 cursor-pointer transition-colors text-left w-full' : ''
      } ${className}`}
    >
      {title && <h3 className="text-white font-semibold mb-3">{title}</h3>}
      {children}
    </Component>
  );
}
