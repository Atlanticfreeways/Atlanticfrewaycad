const ExchangeRateService = require('../../../src/services/ExchangeRateService');
const axios = require('axios');

jest.mock('axios');

describe('ExchangeRateService', () => {
    let service;
    let mockRedis;
    let mockIo;

    beforeEach(() => {
        mockRedis = {
            get: jest.fn(),
            set: jest.fn(),
            publish: jest.fn()
        };
        mockIo = {
            emit: jest.fn()
        };
        service = new ExchangeRateService(mockRedis, { openExchangeRatesAppId: 'test-app-id' }, mockIo);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getRate', () => {
        it('should return the correct rate between two currencies', () => {
            service.memoryCache.set('EUR', 0.92);
            service.memoryCache.set('GBP', 0.82);

            // USD is base (1.0)
            // 1 USD = 0.92 EUR
            // 1 USD = 0.82 GBP
            // Rate EUR to GBP = 0.82 / 0.92 = 0.8913
            const rate = service.getRate('EUR', 'GBP');
            expect(rate).toBeCloseTo(0.8913, 4);
        });

        it('should return 1.0 for the same currency', () => {
            const rate = service.getRate('USD', 'USD');
            expect(rate).toBe(1.0);
        });

        it('should fallback to mock rates if memory cache is empty', () => {
            const rate = service.getRate('USD', 'EUR');
            // Mock EUR is 0.92
            expect(rate).toBe(0.92);
        });
    });

    describe('convert', () => {
        it('should convert amount correctly without spread', () => {
            service.memoryCache.set('EUR', 0.92);
            const result = service.convert(100, 'USD', 'EUR', false);
            expect(result.amount).toBe(92);
            expect(result.rate).toBe(0.92);
            expect(result.spreadApplied).toBe(0);
        });

        it('should apply FIAT spread correctly', () => {
            service.memoryCache.set('EUR', 0.92);
            // FIAT_SPREAD is 0.005
            // Effective rate = 0.92 * (1 - 0.005) = 0.9154
            const result = service.convert(100, 'USD', 'EUR', true);
            expect(result.amount).toBe(91.54);
            expect(result.rate).toBe(0.9154);
            expect(result.spreadApplied).toBe(0.005);
        });

        it('should apply CRYPTO spread correctly', () => {
            // Mock BTC price: 1 USD = 0.000023 BTC
            service.memoryCache.set('BTC', 0.000023);
            // CRYPTO_SPREAD is 0.02
            // Effective rate = 0.000023 * (1 - 0.02) = 0.00002254
            const result = service.convert(100, 'USD', 'BTC', true);
            expect(result.amount).toBeCloseTo(0.002254, 6);
            expect(result.spreadApplied).toBe(0.02);
        });

        it('should apply PAIR-specific spread for USDC', () => {
            service.memoryCache.set('USDC', 1.0);
            // USDC spread is 0.001
            // Effective rate = 1.0 * (1 - 0.001) = 0.999
            const result = service.convert(100, 'USD', 'USDC', true);
            expect(result.amount).toBe(99.9);
            expect(result.spreadApplied).toBe(0.001);
        });
    });

    describe('fetchOpenExchangeRates', () => {
        it('should fetch and update cache with premium API', async () => {
            const mockRates = { rates: { EUR: 0.92, GBP: 0.82 }, timestamp: 12345678 };
            axios.get.mockResolvedValue({ data: mockRates });

            await service.fetchOpenExchangeRates();

            expect(service.memoryCache.get('EUR')).toBe(0.92);
            expect(service.memoryCache.get('_timestamp')).toBe(12345678);
            expect(mockRedis.set).toHaveBeenCalled();
            expect(mockIo.emit).toHaveBeenCalledWith('metrics:rates_updated', mockRates.rates);
        });
    });

    describe('fetchFreeTierRates', () => {
        it('should fetch and update cache with free tier APIs', async () => {
            service.appId = null; // Force free tier

            axios.get.mockImplementation((url) => {
                if (url.includes('frankfurter')) {
                    return Promise.resolve({ data: { rates: { EUR: 0.92 } } });
                }
                if (url.includes('coingecko')) {
                    return Promise.resolve({ data: { bitcoin: { usd: 50000 } } });
                }
            });

            await service.fetchFreeTierRates();

            expect(service.memoryCache.get('EUR')).toBe(0.92);
            // 1 USD = 1/50000 BTC = 0.00002
            expect(service.memoryCache.get('BTC')).toBe(0.00002);
        });
    });
});
