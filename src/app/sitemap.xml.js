//app/sitemap.xml.js

import { httpService } from "@/services/httpService";
import { APP_COUNTRY } from "@/app/config";


function generateSiteMap(data) {
    const extension = APP_COUNTRY === "nl" ? APP_COUNTRY : "es"
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!--We manually set the two URLs we know already-->
     <url>
       <loc>https://findyourcofounder.${extension}</loc>
     </url>
     <url>
       <loc>https://findyourcofounder.${extension}/gdpr</loc>
     </url>
     <url>
       <loc>https://findyourcofounder.${extension}/concept</loc>
     </url>
     <url>
       <loc>https://findyourcofounder.${extension}/legale</loc>
     </url>
   </urlset>
 `;
}
// ${
//     data
//    .map(({ id }) => {
//      return `
//    <url>
//        <loc>${`${EXTERNAL_DATA_URL}/${id}`}</loc>
//    </url>
//  `;
//    })
//    .join('')
// }

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  // We make an API call to gather the URLs for our site
    // const { ok, data } = await httpService.post(`/search?timestamp=${new Date().getTime()}`);

  // We generate the XML sitemap with the data
  const sitemap = generateSiteMap([]);

  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;