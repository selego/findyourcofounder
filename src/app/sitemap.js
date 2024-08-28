//app/sitemap.js

import { httpService } from "@/services/httpService";
import { APP_COUNTRY } from "@/app/config";

function SiteMap({ data }) {
  const extension = APP_COUNTRY === "nl" ? APP_COUNTRY : "es";

  const arr = [];
  arr.push({
    url: `https://findyourcofounder.${extension}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  });
  arr.push({
    url: `https://findyourcofounder.${extension}/gdpr`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  });
  arr.push({
    url: `https://findyourcofounder.${extension}/gdpr`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  });
  arr.push({
    url: `https://findyourcofounder.${extension}/concept`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  });
  arr.push({
    url: `https://findyourcofounder.${extension}/legale`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  });

  for (item of data) {
    arr.push({
      url: `https://findyourcofounder.${extension}/contact/${item._id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  return arr;
}

export async function getServerSideProps({ res }) {
  // We make an API call to gather the URLs for our site
  const { ok, data } = await httpService.post(`/search?timestamp=${new Date().getTime()}`);

  // console.log(data.users.length)

  // // We generate the XML sitemap with the data
  // const sitemap = generateSiteMap(data?.users || []);

  // res.setHeader("Content-Type", "text/xml");
  // // we send the XML to the browser
  // res.write(sitemap);
  // res.end();

  return {
    props: { data: data.users },
  };
}

export default SiteMap;
