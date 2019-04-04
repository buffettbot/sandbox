import { StockPriceInfo } from './stock-price-info';

export enum TradingActionType {
    PURCHASE = 'purchase',
    SELL = 'sell',
    INIT = 'initialize',
}

export class TradingAction {
    constructor(
        public type: TradingActionType,
        public stockPriceInfo: StockPriceInfo,
        public count: number,
    ) {

    }
}
