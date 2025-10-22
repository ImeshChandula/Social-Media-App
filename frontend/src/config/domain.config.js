
const getDomainConfig = () => {
  const baseDomain = import.meta.env.VITE_APP_NODE_ENV === 'development'
    ? import.meta.env.VITE_APP_DEVELOPMENT_BASE_DOMAIN
    : import.meta.env.VITE_APP_PRODUCTION_BASE_DOMAIN;

  const appDomain = import.meta.env.VITE_APP_NODE_ENV === 'development'
    ? import.meta.env.VITE_APP_DEVELOPMENT_DOMAIN
    : import.meta.env.VITE_APP_PRODUCTION_DOMAIN;
  
  // Optional: Add validation
  if (import.meta.env.VITE_APP_NODE_ENV === 'development') {
    console.log('Domain Config:', { baseDomain, appDomain });
  }
  
  return {
    baseDomain,
    appDomain,
    getAllDomains() {
      return [
        '', // No domain (current path)
        `.${this.appDomain}`,
        `${this.appDomain}`,
        `.${this.baseDomain}`,
        `${this.baseDomain}`
      ];
    }
  };
};

export const clearCookiesForAllDomains = (cookieName = 'jwt') => {
  const domainConfig = getDomainConfig();
  const domains = domainConfig.getAllDomains();
  
  const cookiesToClear = domains.map(domain => {
    const domainPart = domain ? ` domain=${domain};` : '';
    return `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;${domainPart}`;
  });

  cookiesToClear.forEach(cookie => {
    document.cookie = cookie;
  });
};

// Export the main function
export default getDomainConfig;