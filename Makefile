REPORTER = dot

test:
	@NODE_ENV=test PORT=9999 ./node_modules/.bin/mocha \
    --reporter $(REPORTER) \
    test/bootstrap.test.js \
    test/**/*.js

.PHONY: test
