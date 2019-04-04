export enum SampleUnit {
    HOUR = 'hour',
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year',
}

export class SampleDuration {
    constructor(public num: number, public unit: SampleUnit) {
    }
}
