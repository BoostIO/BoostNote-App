<div align="center">
  <img src="static/logo_with_text_teal.svg" width="400">

[https://boostnote.io/](https://boostnote.io/)

</div>

![uiimage](./static/img_ui.svg)

<h2 align='center'>Boost Note is a powerful, lightspeed collaborative workspace for developer teams.</h2>

BoostNote.next is a renewal of the [Boostnote app](https://github.com/BoostIO/Boostnote).

## Authors & Maintainers

- [Rokt33r](https://github.com/rokt33r)
- [Komediruzecki](https://github.com/Komediruzecki)

## Community

- [Facebook Group](https://www.facebook.com/groups/boostnote/)
- [Twitter](https://twitter.com/boostnoteapp)
- [Slack Group](https://join.slack.com/t/boostnote-group/shared_invite/zt-cun7pas3-WwkaezxHBB1lCbUHrwQLXw)
- [Blog](https://medium.com/boostnote)
- [Reddit](https://www.reddit.com/r/Boostnote/)

## Development

### Folder structure

- `android` : Android app project. Please open with Android Studio.
- `dist` : Bundled electron app stuff. All executable and installable of the electron app are generated in this folder. You can generate this by `npm run prepack`, `npm run pack`, and `npm run release` scripts.
- `compiled` : Compiled web app resources from `npm run build` script. The resources are for deploying the web app.
- `electron` : Compiled electron resources from `npm run build:electron` script. You can run it by `npm start` script. The resources are for packaging the electron app.
- `ios` : iOS app project. Please open with XCode.
- `src` : Source code.

### Build

Please copy .env.default file and create a file named `.env` in the root of the project directory, or the build will fail.

#### Web app

```sh
# Install dependencies
npm i

# Run webpack and open browser
npm run dev:cloud
```

#### Electron app

```sh
# Install dependencies
npm i

# Run webpack
npm run dev:webpack

# Run electron (You have to open another terminal to run this)
npm run dev:electron
```

> For Windows users, If `npm run dev:electron` doesn't spawn an electron window, please try again after removing `%APPDATA%\electron` directory.

## License

[GPL-3.0 © 2016 - 2021 BoostIO](./LICENSE.md)
