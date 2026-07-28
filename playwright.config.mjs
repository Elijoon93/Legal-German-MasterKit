import {defineConfig} from '@playwright/test';

const externalBase=process.env.LGMK_BASE_URL?.trim();

export default defineConfig({
  testDir:'./tests',
  outputDir:'artifacts/test-results',
  timeout:70_000,
  expect:{timeout:12_000},
  fullyParallel:false,
  workers:1,
  retries:process.env.CI?1:0,
  reporter:[
    ['list'],
    ['html',{outputFolder:'artifacts/playwright-report',open:'never'}],
    ['json',{outputFile:'artifacts/visual-results.json'}]
  ],
  use:{
    baseURL:externalBase||'http://127.0.0.1:4173',
    locale:'fa-IR',
    colorScheme:'light',
    reducedMotion:'reduce',
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
    video:'retain-on-failure'
  },
  webServer:externalBase?undefined:{
    command:'python3 -m http.server 4173 --bind 127.0.0.1',
    url:'http://127.0.0.1:4173/index.html',
    reuseExistingServer:!process.env.CI,
    timeout:120_000
  }
});
