.PHONY: check test run image smoke up down obs helm-lint tf-fmt

check:
	npm --prefix app run check

test: check
	@node app/server.js >/tmp/status-api.log 2>&1 & echo $$! >/tmp/status-api.pid; \
	trap 'kill "$$(cat /tmp/status-api.pid)" 2>/dev/null || true' EXIT; \
	./scripts/smoke.sh; \
	npm --prefix app test

run:
	node app/server.js

image:
	docker build -t status-api:local .

smoke:
	./scripts/smoke.sh

up:
	docker compose up --build -d

down:
	docker compose --profile observability down

obs:
	docker compose --profile observability up --build -d

helm-lint:
	helm lint helm/status-api --set image.tag=local

tf-fmt:
	terraform -chdir=infra/terraform fmt -recursive
