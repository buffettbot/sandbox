
import { StockPriceInfo} from './stock-price-info';
import { TransactionResult } from './transaction-result';
import { TradingAction } from './trading-action';

export interface Commander {
    issueCommand(time: Date, stockPriceInfo: StockPriceInfo, result: TransactionResult): TradingAction;
}
