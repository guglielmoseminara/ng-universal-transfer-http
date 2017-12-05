pretest:
	@node ./node_modules/.bin/tslint -p ./tsconfig.json "./src/**/*.ts" "./test/**/*.ts"
test:
	exit 0
tslint:
	@node ./node_modules/.bin/tslint -p ./tsconfig.json "./src/**/*.ts"
tsc:
	@node ./node_modules/.bin/tsc -p ./tsconfig.build.json
ngc:
	@node ./node_modules/.bin/ngc -p ./tsconfig.build.json
clean:
	@node ./node_modules/.bin/rimraf ./dist ./tmp ./compiler
packaging:
	@node ./node_modules/.bin/ts-node ./tools/packaging.ts


.PHONY: pretest test tslint tsc ngc clean packaging
