interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  }

  return (
    <span 
      className={`font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent ${sizeClasses[size]} ${className}`}
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
    >
      thehackai
    </span>
  )
}