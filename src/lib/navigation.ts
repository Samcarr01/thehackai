// Global navigation utilities that work from any page

export const globalNavigation = {
  // Navigate to Features section (works from any page)
  goToFeatures: () => {
    if (typeof window === 'undefined') return
    
    if (window.location.pathname === '/') {
      // Already on homepage - just scroll
      const element = document.getElementById('features')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // On another page - navigate to home with anchor
      window.location.href = '/#features'
    }
  },

  // Navigate to Pricing section (works from any page)
  goToPricing: () => {
    if (typeof window === 'undefined') return
    
    if (window.location.pathname === '/') {
      // Already on homepage - just scroll
      const element = document.getElementById('pricing')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // On another page - navigate to home with anchor
      window.location.href = '/#pricing'
    }
  }
}