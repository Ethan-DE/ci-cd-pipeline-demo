# Jenkins to GitHub Actions migration

The Jenkinsfile is kept as the old pipeline and `.github/workflows/ci.yml` is the replacement path.

## Stage mapping

| Jenkins | GitHub Actions |
| --- | --- |
| source checkout | `actions/checkout` |
| service test | `app` job |
| Docker build | `container` job |
| smoke test | `container` job |
| security checks | `container` and `config` jobs |
| config validation | `config` job |

## Migration approach

1. Keep Jenkins as the release authority while the Actions workflow runs on the same commits.
2. Compare test results, built image behavior and failure handling for several changes.
3. Move repository checks and branch protection to GitHub Actions once results match.
4. Move image publishing to the release workflow.
5. Disable Jenkins triggers only after the new path has produced repeatable releases.

Credentials should be migrated by purpose, not copied blindly. AWS access should use GitHub OIDC and a short-lived role rather than moving a long-lived access key from Jenkins.

## Rollback

Until Jenkins is decommissioned, rollback is to re-enable its trigger and use the last known-good pipeline definition. Keep the old job configuration read-only during the observation period so it remains reproducible.
