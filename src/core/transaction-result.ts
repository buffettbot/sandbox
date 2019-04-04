import { StockHold} from './stock-hold';
import { TradingActionType} from './trading-action';
import { List } from 'immutable';

export class TransactionResult {
    public static fromInitialCapital(value: number): TransactionResult {
        return new TransactionResult(value, value, TradingActionType.INIT, List());
    }

    constructor(
        public initialCapital: number,
        public remainCapital: number,
        public action: TradingActionType,
        public stockHolds: List<StockHold>,
    ) {}
}
