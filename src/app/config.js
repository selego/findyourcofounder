export const APP_COUNTRY = getCountryCodeFromUrl();


function getCountryCodeFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const parts = hostname.split(".");
    const tld = parts[parts.length - 1];

    return tld;
  } catch () {
    return 'es';
  }
}