// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  API_URL: 'http://localhost:5000',
  WIKIPEDIA_API: 'https://{locale}.wikipedia.org/w/api.php?action=opensearch&format=json&callback=JSONP_CALLBACK',
  WIKIMETRICS_API: 'http://localhost:8080/api/v1',
  LOCALES: ['en', 'es']
};
