REPORTER = dot

test:
	@NODE_ENV=test PORT=9999 sails_log__level="error" ./node_modules/.bin/mocha \
	--reporter $(REPORTER) \
	test/bootstrap.test.js \
	test/**/*.js

	@./node_modules/.bin/webpack \
	--config ./assets/opstools/AppBuilder/test/webpack.config.js \
	--progress \
	> /dev/null

	@./node_modules/mocha-phantomjs/bin/mocha-phantomjs assets/opstools/AppBuilder/test/test-all.html \
	--reporter $(REPORTER) \
	--ignore-resource-errors 

.PHONY: test
