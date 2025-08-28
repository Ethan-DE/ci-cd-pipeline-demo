# CI/CD Pipeline Demo

Minimal Node.js service with two pipelines:
- GitHub Actions (build + unit test + Docker build)
- Jenkins (declarative pipeline doing the same)

## Stack
Node 18, Express, Docker, GitHub Actions, Jenkinsfile.

## Run locally
```bash
npm --prefix app install
node app/server.js
# visit http://localhost:3000/

GitHub Actions

Workflow: .github/workflows/ci.yml
Steps: checkout → setup node → install → start app → tests → docker build.

Jenkins

File: Jenkinsfile
Stages: checkout → install → test → docker build.

Author

Ethan E — eradirideitie@gmail.com

Open to relocation
