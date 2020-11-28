import { STS } from 'aws-sdk/clients/all';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';

import { WorkerPoolAwsSdk } from '../src/worker-pool';
import clientApi from '../src/workers/aws-sdk';

jest.mock('aws-sdk');
jest.mock('aws-sdk/clients/all');

describe('worker pool aws sdk', () => {
    const AWS_CONFIG = {
        region: 'us-east-1',
        credentials: {
            accessKeyId: 'AAAAA',
            secretAccessKey: '11111',
        },
    };

    let workerPool: WorkerPoolAwsSdk;
    let sts: AwsServiceMockBuilder<STS>;

    beforeAll(() => {
        jest.spyOn<any, any>(WorkerPoolAwsSdk.prototype, 'runTask').mockRejectedValue(
            Error('Method runTask should not be called.')
        );
        workerPool = new WorkerPoolAwsSdk({ minThreads: 1, maxThreads: 1 });
        workerPool.runTask = clientApi;
    });

    beforeEach(() => {
        sts = on(STS, { snapshot: false });
        const response = {
            Account: '123456789012',
            Arn: 'arn:aws:iam::123456789012:user/Alice',
            UserId: 'AKIAI44QH8DHBEXAMPLE',
        };
        sts.mock('getCallerIdentity').resolve(response);
        sts.mock('makeRequest').resolve(response);
    });

    afterEach(() => {
        workerPool.restart();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await workerPool.shutdown();
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
        await workerPool.shutdown();
        try {
            await workerPool.runAwsTask(null);
        } catch (err) {
            expect(err.name).toBe('TypeError');
        }
        await workerPool.shutdown();
        expect(workerPool.queueSize).toBe(0);
        expect(workerPool.drained).toBe(true);
        expect(workerPool.done).toBe(false);
    });

    it('should succeed with simple aws call', async () => {
        const sts = new STS(AWS_CONFIG);
        const result = await workerPool.runAwsTask<STS>({
            name: 'sts',
            options: sts.config,
            operation: 'getCallerIdentity',
        });
        expect(result).toMatchObject({
            Account: '123456789012',
            Arn: 'arn:aws:iam::123456789012:user/Alice',
            UserId: 'AKIAI44QH8DHBEXAMPLE',
        });
    });
});
