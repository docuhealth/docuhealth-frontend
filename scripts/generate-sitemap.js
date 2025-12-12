import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';

const links = [
  { url: '/' },
  { url: '/our-vision' },
  { url: '/our-mission' },
  { url: '/docuhealth-news' },
  { url: '/docuhealth-api' },
  { url: '/our-legal-notice' },
  { url: '/our-privacy-policy' },
  { url: '/user-login' },
  { url: '/user-create-account' },
  { url: '/user-forgot-password' },
];

const sitemap = new SitemapStream({ hostname: 'https://docuhealthservices.net' });
const writeStream = createWriteStream('./public/sitemap.xml');

streamToPromise(sitemap)
  .then(() => console.log('Sitemap created!'))
  .catch(console.error);

links.forEach(link => sitemap.write(link));
sitemap.end();
sitemap.pipe(writeStream);
