# SKY UX Builder Config

Configuration files for SKY UX Builder when running on different platforms.

## Environment Configuration

**Travis-CI (environment variables)**

- `BROWSER_STACK_USERNAME`
- `BROWSER_STACK_ACCESS_KEY`
- `BROWSER_STACK_BUILD_ID`
- `BROWSER_STACK_PROJECT`

**VSTS (command-line arguments)**
- `--buildNumber "BUILD_NUMBER_HERE"`
- `--buildDefinitionName "DEF_NAME_HERE"`
- `--bsUser ********`
- `--bsKey ********`

**Visual Tests**

- `VISUAL_FAILURES_REPO_URL` A secure repo URL created by the SPA repo owners in this format: `https://{access_token}@github.com/{org_name}/{repo_name}.git`
- `VISUAL_BASELINES_REPO_URL` A secure repo URL created by the SPA repo owners in this format: `https://{access_token}@github.com/{org_name}/{repo_name}.git`