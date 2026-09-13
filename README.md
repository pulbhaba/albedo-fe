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
relative API paths, and the dev server routes auth endpoints (`/oauth2`,
`/public`, `/user`, `/admin`, and `/actuator`) to the auth service and novel
endpoints (`/novels` and `/library`) to the novels service.

```
VUE_AUTH_API_URL=
VUE_NOVELS_API_URL=
VUE_AUTH_PROXY_TARGET=http://localhost:8080
VUE_NOVELS_PROXY_TARGET=http://localhost:8000
VUE_APP_CLIENT_ID=albedo-client
VUE_APP_CLIENT_SECRET=albedo-secret
```

Copy `.env.sample` to `.env` if you need to override these values. Set
`VUE_AUTH_API_URL` or `VUE_NOVELS_API_URL` only when the frontend should call a
service directly instead of using the local dev proxy.

Novel listings use the authenticated novel service at `GET /novels`, while
library operations use `/library`. Local development proxies both paths to
`VUE_NOVELS_PROXY_TARGET`; set `VUE_NOVELS_API_URL` when the novels service is
hosted separately.

### TypeScript migration

The project uses `tsconfig.json` and the Vue CLI TypeScript plugin. Source
migration is incremental: new shared modules should use TypeScript, while
existing JavaScript modules can be migrated in focused changes.

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
