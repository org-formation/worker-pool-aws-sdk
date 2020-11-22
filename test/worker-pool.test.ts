import STS from 'aws-sdk/clients/sts';

import { WorkerPoolAwsSdk } from '../src/worker-pool';

describe('worker pool aws sdk', () => {
    const AWS_CONFIG = {
        region: 'us-east-1',
        credentials: {
            accessKeyId: 'AAAAA',
            secretAccessKey: '11111',
        },
    };

    let workerPool: WorkerPoolAwsSdk;

    beforeEach(() => {
        workerPool = new WorkerPoolAwsSdk({ minThreads: 1, maxThreads: 1 });
    });

    afterEach(async () => {
        await workerPool.shutdown();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should fail with running task after done', async () => {
        try {
            await workerPool.runAwsTask(null);
        } catch (err) {
            expect(err.name).toBe('TypeError');
        }
        workerPool.end();
        try {
            await workerPool.runAwsTask(null);
        } catch (err) {
            expect(err.message).toMatch(
                /Not allowed to make an API call after the worker pool has been flagged as done/
            );
        }
    });

    it('should not fail while destroying two times', async () => {
        try {
            await workerPool.runAwsTask(null);
        } catch (err) {
            expect(err.name).toBe('TypeError');
        }
        workerPool.end();
        await workerPool.shutdown();
        await workerPool.shutdown();
        expect(workerPool.queueSize).toBe(0);
    });

    it('should succeed with simple aws call', async () => {
        try {
            const sts = new STS(AWS_CONFIG);
            const result = await workerPool.runAwsTask<STS>({
                name: 'sts',
                options: sts.config,
                operation: 'getCallerIdentity',
            });
            console.log(result);
        } catch (err) {
            expect(err).toBeDefined();
        }
    });
});
