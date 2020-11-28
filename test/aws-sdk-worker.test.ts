import { STS } from 'aws-sdk/clients/all';
import { on, AwsServiceMockBuilder } from '@jurijzahn8019/aws-promise-jest-mock';

import clientApi, { ClientApiOptions } from '../src/workers/aws-sdk';

jest.mock('aws-sdk');
jest.mock('aws-sdk/clients/all');

describe('aws sdk worker', () => {
    const AWS_CONFIG = {
        region: 'us-east-1',
        credentials: {
            accessKeyId: 'AAAAA',
            secretAccessKey: '11111',
        },
    };

    let sts: AwsServiceMockBuilder<STS>;

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
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should fail with plain type error', async () => {
        try {
            await clientApi(null);
        } catch (err) {
            expect(err).toMatchObject({
                name: 'TypeError',
                message: expect.stringContaining('Cannot destructure property'),
            });
        }
    });

    it('should fail with unable to find service', async () => {
        try {
            await clientApi({ name: 'NonExistentService' } as ClientApiOptions);
        } catch (err) {
            expect(err.message).toMatch(/unable to find aws service/i);
        }
    });

    it('should succeed with simple aws call', async () => {
        const sts = new STS(AWS_CONFIG);
        const result = await clientApi<STS>({
            name: (sts.constructor as any).serviceIdentifier,
            options: { ...sts.config, ...AWS_CONFIG },
            operation: 'getCallerIdentity',
            input: {},
            headers: {
                'X-Dummy-Header': 'DUMMY HEADER',
            },
        });
        expect(result).toMatchObject({
            Account: '123456789012',
            Arn: 'arn:aws:iam::123456789012:user/Alice',
            UserId: 'AKIAI44QH8DHBEXAMPLE',
        });
    });
});
