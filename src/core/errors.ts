export enum ErrorType {
    ITME_MISSING_IN_STOCKHOLD = 'can not find item in stock hold',
    REMAINING_COUNT_OF_ITEM_IS_NOT_ENOUGH = 'remaining count of item is not enough for doing action',
    UNSUPPORTED_ACTION = 'unsupported action',
}

export class BaseError extends Error {
    constructor(type: ErrorType | string) {
        super(type.toString());
    }
}
