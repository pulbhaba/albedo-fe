# siththara

## Project setup
```
npm install
```

## Contributing

Changes follow an issue-to-pull-request workflow. Create or claim a GitHub issue,
branch from `dev`, validate the change, and open a pull request back to `dev`.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch naming, commit, and pull
request requirements.

## Local backend configuration

By default, local development uses the Vue dev-server proxy. Frontend code calls
relative API paths such as `/oauth2/token`, and the dev server forwards `/oauth2`,
`/public`, `/user`, and `/actuator` to the local auth backend at
`http://localhost:8080`.

```
VUE_APP_API_URL=
VUE_APP_BACKEND_PROXY_TARGET=http://localhost:8080
VUE_APP_CLIENT_ID=albedo-client
VUE_APP_CLIENT_SECRET=albedo-secret
```

Copy `.env.sample` to `.env` if you need to override these values. Set
`VUE_APP_API_URL` only when the frontend should call a backend directly instead
of using the local dev proxy.

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
