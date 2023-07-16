# Baby Journal

This project is an installable PWA for tracking baby/toddler activities.

## Building

This app is built using Angular, you can build it easily by running `./node_modules/.bin/ng build`.
This will create a `dist/baby-tracker-ui` directory.
Its contents can be deployed to any webserver.
You can also check [the GitHub workflow file](.github/workflows/publish.yaml) used to deploy this app via serverless.

## Configuration

You can configure the app by changing [environment.ts](src/environments/environment.ts). Possible configurations:

- `apiUrl` - the default API url. Note that this can be changed in-app, this is just the default value.
- `demoAccountCode` - the export key of a demo account which can be used to test the app out by providing `demo-account` as the restore key. It can be empty, 
in that case the special restore key `demo-account` will not work.

Other places which might need changing if you want to host the app yourself:

- [assetlinks.json](src/assets/assetlinks.json) - for configuring an Android wrapper app (TWA), if you won't be using a TWA, you may delete the file,
otherwise change `package_name` and `sha256_cert_fingerprints` according to [the documentation](https://developer.android.com/training/app-links/verify-android-applinks#web-assoc).
- [manifest.webmanifest](src/manifest.webmanifest) - another file for configuring the TWA, read more in [the documentation](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- icons:
  - all files in [icons](src/assets/icons) directory
  - [favicon.ico](src/favicon.ico)
- [index.html](src/index.html), on line 5 there's the default app name which might be displayed before the app is loaded
- [title.service.ts](src/app/services/title.service.ts) - there's a property called `defaultTitle`
