import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://areej-1.github.io',
  base: '/electric_car_website',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
