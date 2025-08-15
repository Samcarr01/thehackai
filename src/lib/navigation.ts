// Global navigation utilities that work from any page

export const globalNavigation = {
  // Navigate to Features section (works from any page)
  goToFeatures: () => {
    if (typeof window === 'undefined') return
    
    if (window.location.pathname === '/') {
      // Already on homepage - scroll with mobile header offset
      const element = document.getElementById('features')
      if (element) {
        const headerOffset = 80 // Account for mobile header height
        const elementPosition = element.offsetTop - headerOffset
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        })
      }
    } else {
      // On another page - navigate to home with anchor and scroll handler
      window.location.href = '/#features'
    }
  },

  // Navigate to Pricing section (works from any page)
  goToPricing: () => {
    if (typeof window === 'undefined') return
    
    if (window.location.pathname === '/') {
      // Already on homepage - scroll with mobile header offset
      const element = document.getElementById('pricing')
      if (element) {
        const headerOffset = 80 // Account for mobile header height
        const elementPosition = element.offsetTop - headerOffset
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        })
      }
    } else {
      // On another page - navigate to home with anchor and scroll handler
      window.location.href = '/#pricing'
    }
  }
}