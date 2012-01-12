build:
	coffee build.coffee

server:
	coffee server/zapp.coffee

watch:
	coffee watch.coffee

.PHONY: build server watch