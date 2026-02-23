# Angular Example

This example demonstrates `@toruslabs/customauth` in a modern Angular app with both popup and redirect UX modes.

## Run locally

```bash
cd examples/angular-app
npm install
npm start
```

Open `http://localhost:3000`.

## Routes

- `/` Home page with flow links
- `/popup-mode` Popup login flow
- `/redirect-mode` Redirect login flow
- `/auth` Redirect callback page

## Notes

- Popup mode uses `baseUrl: <origin>/serviceworker`.
- Redirect mode uses `baseUrl: <origin>` and `redirectPathName: auth`.
- Service worker assets are served from `src/serviceworker` at `/serviceworker/*`.
- Verifier/client configuration follows `examples/vue-app/src/config.ts`.
# AngularApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:3000/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
