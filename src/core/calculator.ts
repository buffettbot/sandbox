
import { TransactionResult } from './transaction-result';
import { TradingAction, TradingActionType } from './trading-action';
import { StockHold } from './stock-hold';
import { BaseError, ErrorType } from './errors';

export class Calculator {

    public static calculate(
        previousResult: TransactionResult,
        tradingAction: TradingAction,
    ): TransactionResult {
        if (tradingAction.type === TradingActionType.PURCHASE) {
            return Calculator.calculateforPurchase(previousResult, tradingAction);
        } else if (tradingAction.type === TradingActionType.SELL) {
            return Calculator.calculateForSell(previousResult, tradingAction);
        } else {
            throw new BaseError(ErrorType.UNSUPPORTED_ACTION);
        }
    }

    private static calculateAverageCost(previousStockHold: StockHold, tradingAction: TradingAction): number {
        const originalCost = previousStockHold.count * previousStockHold.averageCost;
        const newActionCost = tradingAction.count * tradingAction.stockPriceInfo.closePrice;

        const totalAmount = tradingAction.type === TradingActionType.PURCHASE ?
            tradingAction.count + previousStockHold.count :
            previousStockHold.count - tradingAction.count;

        const newCost = tradingAction.type === TradingActionType.PURCHASE ?
            (originalCost + newActionCost) / totalAmount  :
            previousStockHold.averageCost ;
        return newCost;
    }


    private static calculateforPurchase(
        previousResult: TransactionResult,
        tradingAction: TradingAction,
    ): TransactionResult {
        const actionValue = (tradingAction.count * tradingAction.stockPriceInfo.closePrice);
        const remainingCapital = previousResult.remainCapital - actionValue;

        const targetStock = previousResult.stockHolds.find((x) => x.stockId === tradingAction.stockPriceInfo.stockId);
        if (targetStock == null) {
            const stockHolds = previousResult.stockHolds.push(
                new StockHold(
                    tradingAction.stockPriceInfo.closePrice,
                    tradingAction.count,
                    tradingAction.stockPriceInfo.stockId,
                ),
            );
            return new TransactionResult(
                previousResult.initialCapital,
                remainingCapital,
                tradingAction.type,
                stockHolds,
            );
        } else {
            return new TransactionResult(
                previousResult.initialCapital,
                remainingCapital,
                tradingAction.type,
                previousResult.stockHolds.filter((x) => x !== targetStock).push(
                    new StockHold(
                        Calculator.calculateAverageCost(targetStock, tradingAction),
                        tradingAction.count + targetStock.count,
                        tradingAction.stockPriceInfo.stockId,
                    ),
                ),
            );
        }
    }

    private static calculateForSell(
        previousResult: TransactionResult,
        tradingAction: TradingAction,
    ): TransactionResult {
        const actionValue = (tradingAction.count * tradingAction.stockPriceInfo.closePrice);
        const remainingCapital = previousResult.remainCapital + actionValue;

        const targetStock = previousResult.stockHolds.find((x) => x.stockId === tradingAction.stockPriceInfo.stockId);
        if (targetStock == null) {
            throw new BaseError(ErrorType.ITME_MISSING_IN_STOCKHOLD);
        } else if (targetStock.count < tradingAction.count) {
            throw new BaseError(ErrorType.REMAINING_COUNT_OF_ITEM_IS_NOT_ENOUGH);
        } else if (targetStock.count === tradingAction.count) {
            return new TransactionResult(
                previousResult.initialCapital,
                remainingCapital,
                tradingAction.type,
                previousResult.stockHolds.filter((x) => x !== targetStock),
            );
        } else {
            return new TransactionResult(
                previousResult.initialCapital,
                remainingCapital,
                tradingAction.type,
                previousResult.stockHolds.filter((x) => x !== targetStock).push(
                    new StockHold(
                        Calculator.calculateAverageCost(targetStock, tradingAction),
                        targetStock.count - tradingAction.count,
                        tradingAction.stockPriceInfo.stockId,
                    ),
                ),
            );
        }
    }

}
