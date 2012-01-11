build: build-client

build-client:
	cd client && node ../node_modules/squash/bin/cli.js --coffee -f scripts/app.js -r ./scripts/app.coffee=app

server:
	coffee server/server.coffee

watch:
	cd client && node ../node_modules/squash/bin/cli.js --coffee -f scripts/app.js -r -w ./scripts/app.coffee=app

.PHONY: server