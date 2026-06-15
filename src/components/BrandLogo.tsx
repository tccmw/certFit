interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  subtitle?: string
  center?: boolean
  inverse?: boolean
}

const sizeMap = {
  sm: {
    icon: 'h-9 w-9',
    image: 'h-5 w-5',
    title: 'text-lg',
    subtitle: 'text-xs',
  },
  md: {
    icon: 'h-10 w-10',
    image: 'h-6 w-6',
    title: 'text-xl',
    subtitle: 'text-xs',
  },
  lg: {
    icon: 'h-12 w-12',
    image: 'h-7 w-7',
    title: 'text-xl',
    subtitle: 'text-sm',
  },
}

export function BrandLogo({ size = 'md', subtitle, center = false, inverse = false }: BrandLogoProps) {
  const styles = sizeMap[size]

  return (
    <div className={`brand-mark ${center ? 'justify-center text-center' : ''}`}>
      <span className={`brand-icon ${styles.icon}`}>
        <img src="/favicon.svg" alt="" className={`${styles.image} object-contain`} />
      </span>
      <span>
        <span className={`${styles.title} block font-bold tracking-normal ${inverse ? 'text-white' : 'text-ink'}`}>certFit</span>
        {subtitle && (
          <span className={`${styles.subtitle} block font-medium ${inverse ? 'text-white/78' : 'text-muted'}`}>{subtitle}</span>
        )}
      </span>
    </div>
  )
}
