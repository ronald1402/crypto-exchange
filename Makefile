.PHONY=dev

install:
	npm install

dev:
	npm run dev

build:
	npm build

test:
	npm run lint
	npm test
