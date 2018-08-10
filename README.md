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
- `SKY_VISUAL_FAILURES_ACCESS_TOKEN` An access token created by [blackbaud/skyux-visualtest-results](https://github.com/blackbaud/skyux-visualtest-results) repo owners. This token is provided to each SPA on-request.
- `SKY_VISUAL_BASELINES_ACCESS_TOKEN` An access token created by the SPA repo owners.
