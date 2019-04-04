import { expect } from 'chai';
import { Calculator } from '@/core/calculator';
import { TransactionResult } from '@/core/transaction-result';
import { TradingAction, TradingActionType } from '@/core/trading-action';
import { StockPriceInfo } from '@/core/stock-price-info';
import { StockHold } from '@/core/stock-hold';
import { BaseError, ErrorType } from '@/core/errors';

describe('Calculator', () => {
    const STOCKID = 2002;
    const initialCapital = 100000;
    const amount = 10;
    const closePrice = 95;
    const expectedRemainingCaptial = 99050; // initialCapital - (closePrice * amount)
    const initResult = TransactionResult.fromInitialCapital(initialCapital);
    const result = Calculator.calculate(
        initResult,
        new TradingAction(
            TradingActionType.PURCHASE,
            new StockPriceInfo(
                STOCKID,
                93,
                90,
                closePrice,
                new Date(),
                new Date(),
                amount,
            ),
            amount,
        ),
    );

    it('can not do calculation for actions other than sell/purchse', () => {
        [TradingActionType.INIT].forEach((x) => {
            expect(() => {
                Calculator.calculate(
                    initResult,
                    new TradingAction(
                        x,
                        new StockPriceInfo(
                            STOCKID,
                            93,
                            90,
                            closePrice,
                            new Date(),
                            new Date(),
                            amount,
                        ),
                        amount,
                    ),
                );
            }).to.throws(
                ErrorType.UNSUPPORTED_ACTION.toString(),
                'calculator should throw exception for doing action' + x.toString(),
            );
        });
    });

    describe('can do calculation for purchasing item', () => {
        it('update remainingCaptical and add stock hold', () => {
            expect(initResult.initialCapital).equal(initResult.remainCapital);
            // expect(initResult.stockHolds).to.be.empty;
            expect(initResult.action).equals(TradingActionType.INIT);

            expect(result.initialCapital).equal(initialCapital);
            expect(result.action).equal(TradingActionType.PURCHASE);
            expect(result.remainCapital).equals(expectedRemainingCaptial);
            expect(result.stockHolds.get(0)).to.eql(new StockHold(closePrice, amount, STOCKID));
        });

        it('update averageCost of stockhold if purchase same item twice', () => {
            const result2 = Calculator.calculate(
                result,
                new TradingAction(
                    TradingActionType.PURCHASE,
                    new StockPriceInfo(
                        STOCKID,
                        93,
                        90,
                        closePrice + 10,
                        new Date(),
                        new Date(),
                        amount,
                    ),
                    amount,
                ),
            );
            const expectedAverageCost = (closePrice * amount + (closePrice + 10) * amount) / (2 * amount);

            expect(result2.initialCapital).equal(initialCapital);
            expect(result2.action).equal(TradingActionType.PURCHASE);
            expect(result2.stockHolds.size).equal(1);
            expect(result2.remainCapital).equals(result.remainCapital - ((closePrice + 10) * amount));
            expect(result2.stockHolds.get(0)).to.eql(new StockHold(expectedAverageCost, amount * 2, STOCKID));
        });
    });

    describe('can do calculation for sold item', () => {
        it('update averageCost of stockhold and update count of stackhold if ' +
        'seld count is smaller then hold count', () => {
            const sellAmount = 5;
            const newClosePrice = 100;
            const result2 = Calculator.calculate(
                result,
                new TradingAction(
                    TradingActionType.SELL,
                    new StockPriceInfo(
                        STOCKID,
                        93,
                        90,
                        newClosePrice,
                        new Date(),
                        new Date(),
                        amount,
                    ),
                    sellAmount,
                ),
            );

            expect(result2.initialCapital).equal(initialCapital);
            expect(result2.action).equal(TradingActionType.SELL);
            expect(result2.stockHolds.size).equal(1);
            expect(result2.stockHolds.get(0)).to.be.eql(new StockHold(closePrice, 5, STOCKID));
            expect(result2.remainCapital).equals(99550);
        });

        it('update averageCost of stockhold and clean stockhold if sell same item at same count', () => {
            const result2 = Calculator.calculate(
                result,
                new TradingAction(
                    TradingActionType.SELL,
                    new StockPriceInfo(
                        STOCKID,
                        93,
                        90,
                        closePrice + 10,
                        new Date(),
                        new Date(),
                        amount,
                    ),
                    amount,
                ),
            );

            expect(result2.initialCapital).equal(initialCapital);
            expect(result2.action).equal(TradingActionType.SELL);
            expect(result2.stockHolds.size).equal(0);
            expect(result2.remainCapital).equals(initialCapital + (10) * amount);
        });

        it('can not calculate for selling items that more than already have', () => {
            expect(() => {
                Calculator.calculate(
                    result,
                    new TradingAction(
                        TradingActionType.SELL,
                        new StockPriceInfo(
                            STOCKID,
                            93,
                            90,
                            closePrice,
                            new Date(),
                            new Date(),
                            amount,
                        ),
                        1000,
                    ),
                );
            }).to.throws(ErrorType.REMAINING_COUNT_OF_ITEM_IS_NOT_ENOUGH.toString());
        });

        it('can not calculate for selling item that didn\'t held', () => {
            expect(() => {
                Calculator.calculate(
                    result,
                    new TradingAction(
                        TradingActionType.SELL,
                        new StockPriceInfo(
                            STOCKID + 1000,
                            93,
                            90,
                            closePrice,
                            new Date(),
                            new Date(),
                            amount,
                        ),
                        1000,
                    ),
                );
            }).to.throws(ErrorType.ITME_MISSING_IN_STOCKHOLD.toString());
        });
    });
});
