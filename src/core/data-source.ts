import { StockPriceInfo } from './stock-price-info';
import { SampleDuration } from './sample-duration';

export interface DataSource {
    query(stockId: number, startTime: Date, endTime: Date, sampleDuration: SampleDuration): StockPriceInfo;
}
