'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  color?: 'purple' | 'white' | 'blue' | 'green' | 'gray'
  text?: string
  className?: string
  fullScreen?: boolean
}

const sizeConfig = {
  sm: { spinner: 'w-4 h-4', text: 'text-sm', container: 'gap-2' },
  md: { spinner: 'w-6 h-6', text: 'text-base', container: 'gap-3' },
  lg: { spinner: 'w-8 h-8', text: 'text-lg', container: 'gap-4' },
  xl: { spinner: 'w-12 h-12', text: 'text-xl', container: 'gap-4' }
}

const colorConfig = {
  purple: {
    spinner: 'border-purple-500 border-t-transparent',
    dots: 'bg-purple-500',
    text: 'text-purple-300',
    pulse: 'bg-purple-500/20',
    bars: 'bg-purple-500'
  },
  white: {
    spinner: 'border-white border-t-transparent',
    dots: 'bg-white',
    text: 'text-white',
    pulse: 'bg-white/20',
    bars: 'bg-white'
  },
  blue: {
    spinner: 'border-blue-500 border-t-transparent',
    dots: 'bg-blue-500',
    text: 'text-blue-300',
    pulse: 'bg-blue-500/20',
    bars: 'bg-blue-500'
  },
  green: {
    spinner: 'border-green-500 border-t-transparent',
    dots: 'bg-green-500',
    text: 'text-green-300',
    pulse: 'bg-green-500/20',
    bars: 'bg-green-500'
  },
  gray: {
    spinner: 'border-gray-400 border-t-transparent',
    dots: 'bg-gray-400',
    text: 'text-gray-300',
    pulse: 'bg-gray-400/20',
    bars: 'bg-gray-400'
  }
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  color = 'purple',
  text,
  className,
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizeStyles = sizeConfig[size]
  const colorStyles = colorConfig[color]

  const SpinnerVariant = () => (
    <div
      className={cn(
        'rounded-full border-2 animate-spin',
        sizeStyles.spinner,
        colorStyles.spinner
      )}
      aria-label="Loading spinner"
    />
  )

  const DotsVariant = () => (
    <div className="flex space-x-1" aria-label="Loading dots">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            size === 'sm' ? 'w-1.5 h-1.5' : 
            size === 'md' ? 'w-2 h-2' : 
            size === 'lg' ? 'w-3 h-3' : 'w-4 h-4',
            colorStyles.dots
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  )

  const PulseVariant = () => (
    <div className="flex space-x-2" aria-label="Loading pulse">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-sm',
            size === 'sm' ? 'w-1 h-4' : 
            size === 'md' ? 'w-1.5 h-6' : 
            size === 'lg' ? 'w-2 h-8' : 'w-3 h-12',
            colorStyles.bars
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )

  const BarsVariant = () => (
    <div className="flex space-x-1" aria-label="Loading bars">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'animate-pulse rounded-sm',
            size === 'sm' ? 'w-0.5 h-3' : 
            size === 'md' ? 'w-1 h-4' : 
            size === 'lg' ? 'w-1.5 h-6' : 'w-2 h-8',
            colorStyles.bars
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  )

  const renderSpinner = () => {
    switch (variant) {
      case 'dots': return <DotsVariant />
      case 'pulse': return <PulseVariant />
      case 'bars': return <BarsVariant />
      default: return <SpinnerVariant />
    }
  }

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeStyles.container,
        className
      )}
    >
      {renderSpinner()}
      {text && (
        <p
          className={cn(
            'font-medium animate-pulse text-center',
            sizeStyles.text,
            colorStyles.text
          )}
        >
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-8 border border-purple-500/30 shadow-2xl">
          {content}
        </div>
      </div>
    )
  }

  return content
}

// Preset components for common use cases
export const PageLoading = ({ text = "Loading page..." }: { text?: string }) => (
  <div className="min-h-[50vh] flex items-center justify-center px-4">
    <div className="text-center w-full max-w-sm mx-auto">
      <LoadingSpinner size="lg" text={text} />
    </div>
  </div>
)

export const ButtonLoading = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => (
  <LoadingSpinner size={size} variant="spinner" color="white" />
)

export const CardLoading = ({ text = "Loading..." }: { text?: string }) => (
  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-8 border border-purple-500/20 animate-pulse">
    <LoadingSpinner size="md" text={text} />
  </div>
)

export const FullScreenLoading = ({ text = "Loading..." }: { text?: string }) => (
  <LoadingSpinner size="xl" text={text} fullScreen />
)

// List loading skeleton
export const ListSkeleton = ({ items = 3, className }: { items?: number; className?: string }) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={i}
        className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-lg p-4 animate-pulse border border-gray-600/30"
      >
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-purple-500/20 h-10 w-10"></div>
          <div className="flex-1">
            <div className="h-4 bg-purple-500/20 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-600/30 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Card grid skeleton
export const CardGridSkeleton = ({ cards = 6, className }: { cards?: number; className?: string }) => (
  <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
    {Array.from({ length: cards }).map((_, i) => (
      <div
        key={i}
        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 animate-pulse border border-purple-500/20"
      >
        <div className="space-y-4">
          <div className="h-6 bg-purple-500/20 rounded w-2/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-600/30 rounded"></div>
            <div className="h-4 bg-gray-600/30 rounded w-5/6"></div>
            <div className="h-4 bg-gray-600/30 rounded w-4/6"></div>
          </div>
          <div className="h-10 bg-purple-500/20 rounded"></div>
        </div>
      </div>
    ))}
  </div>
)