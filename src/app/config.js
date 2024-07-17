export const APP_COUNTRY = process.env.APP_COUNTRY ?? getCountryCodeFromCurrentUrl();


function getCountryCodeFromCurrentUrl() {
  try{
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    const tld = parts[parts.length - 1];
    return tld;
  }catch{
     return 'es'
  }
}