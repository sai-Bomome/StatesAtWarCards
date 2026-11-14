# Deploy to GitHub Pages

This is a static Vite game. GitHub Pages hosts the built game; multiplayer uses the existing PeerJS signaling service and peer connections. No application server or deployment secrets are required. Players still need compatible networks; there is no bundled TURN relay, reconnect, or host migration.

## First deployment

1. Create an empty GitHub repository and push this project to `main` or `master`.
2. In the repository, open **Settings → Pages → Build and deployment** and select **GitHub Actions** as the source.
3. Open **Actions → Deploy game to GitHub Pages → Run workflow**, or push another commit.
4. Open the published URL shown by the deployment. Share that URL, rather than a localhost invite, for online matches.

The workflow installs from the lockfile, runs the test suite, builds with the repository's Pages base path, and publishes only `dist`. Source files, test fixtures and development screenshots are not published as part of the game bundle. Both `main` and `master` trigger deployment.

GitHub Pages availability depends on repository visibility and the account plan. Enable Actions and allow Pages deployments in repository settings if organization policies restrict them.

## Local deployment check

```powershell
npm test
$env:PAGES_BASE_PATH = '/StatesAtWarCards/'
npm run build
node scripts/check-build.mjs
Remove-Item Env:PAGES_BASE_PATH
npm exec vite preview -- --host 127.0.0.1
```

Visit the preview server at `/StatesAtWarCards/` when testing this sample base path. The workflow obtains the actual path from GitHub Pages configuration, including when a custom domain is used.

Action revisions are pinned to the official Vite deployment example. The build check verifies emitted HTML/CSS asset references against actual files in dist, including the repository subpath. It fails before deployment when local assets are missing.
