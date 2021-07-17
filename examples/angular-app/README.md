# Direct Web SDK - Angular App Notes

For general instructions [click here](https://github.com/torusresearch/torus-direct-web-sdk)

How to run example

1. Build the outer project using `npm pack`
2. Install the built tgz file in this folder using `npm i ../../toruslabs-.......`
## Running the App locally
Requires [http-server](https://github.com/http-party/http-server) installed globally.

Add these scripts on package.json. Some login providers require `https` connection

```
"scripts" {
    "start": "ng serve --port 3000",
    "start:https": "npm run build && http-server -S -C cert.pem -p 3000 -c-1 dist/angular-app",
}
```

# AngularApp Guide

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
