export class StockPriceInfo {
    constructor(
        public stockId: number,
        public averagePrice: number,
        public openPrice: number,
        public closePrice: number,
        public startTime: Date,
        public endTime: Date,
        public volume: number,
    ) {

    }

    public get sampleDuration() {
        return null;
    }
}
