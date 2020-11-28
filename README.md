# Worker Pool for AWS SDK

[![License MIT](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/org-formation/worker-pool-aws-sdk/issues) [![Project Status: WIP – Initial development](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)

Simple pool of workers to make API calls using the AWS SDK, while leveraging Node.js Worker threads.

-----

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/org-formation/worker-pool-aws-sdk/cicd/master)](https://github.com/org-formation/worker-pool-aws-sdk/actions?query=branch%3Amaster+workflow%3Acicd) [![Codecov](https://img.shields.io/codecov/c/gh/org-formation/worker-pool-aws-sdk)](https://codecov.io/gh/org-formation/worker-pool-aws-sdk) [![GitHub release](https://img.shields.io/github/v/release/org-formation/worker-pool-aws-sdk?include_prereleases)](https://github.com/org-formation/worker-pool-aws-sdk/releases) [![Node.js version](https://img.shields.io/badge/dynamic/json?color=brightgreen&url=https://raw.githubusercontent.com/org-formation/worker-pool-aws-sdk/master/package.json&query=$.engines.node&label=nodejs)](https://nodejs.org/)

This library uses Node.js Worker threads (it depends more specifically on [Piscina.js](https://github.com/piscinajs/piscina)).

## Usage

**Example**

```javascript
const STS = require('aws-sdk/clients/sts')
const WorkerPoolAwsSdk = require('worker-pool-aws-sdk');

const workerPool = new WorkerPoolAwsSdk();

(async function () {
  const sts = new STS({ region: 'us-east-1' });
  const result = await workerPool.runAwsTask({
    name: 'sts',
    options: sts.config,
    operation: 'getCallerIdentity',
  });
  console.log(result);
  /*
    Prints result in this shape:
    {
      Account: "123456789012", 
      Arn: "arn:aws:iam::123456789012:user/Alice", 
      UserId: "AKIAI44QH8DHBEXAMPLE"
    }
  */
})();
```

## Benchmark

Total duration of SAM local lambda with and without worker threads running on a Quad-core machine.

### Without worker threads (40 calls)
1. 20073.56 ms
2. 20373.04 ms
3. 23854.06 ms

### With worker threads (40 calls)
1. 23107.90 ms
2. 24376.02 ms
3. 24748.50 ms


### Without worker threads (400 calls)
1. 160664.08 ms
2. 170526.89 ms

### With worker threads (400 calls)
1. 160884.88 ms
2. 161868.81 ms


## Development

Check out the master branch and install dependencies to get started:

```
npm ci --optional
```

Now that you have the dependencies installed, you can run this command in the root folder to compile the whole project.

```
npm run build
```

Linting is done via [TypeScript ESLint](https://github.com/typescript-eslint/typescript-eslint) and running unit tests via [Jest](https://jestjs.io/). The continuous integration runs these checks, but you can run them locally with:

```
npm run lint
npm test
```

## License

This library is licensed under the [MIT License](./LICENSE).
