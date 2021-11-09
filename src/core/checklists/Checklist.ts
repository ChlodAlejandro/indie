export interface Check<ThisType> {
    required?: boolean;
    check: (this: ThisType) => boolean;
}

export type PerformedChecklist<T, U extends Record<string, Check<T>>> = {
    result: ChecklistResult;
} & Record<keyof U, boolean>;

export enum ChecklistResult {
    PASS,
    WARN,
    FAIL
}

export default class Checklist<ThisType> {

    constructor(private context : ThisType) { }

    performChecks<T extends Record<string, Check<ThisType>>>(checks : T) : PerformedChecklist<ThisType, T> {
        let result = ChecklistResult.PASS;

        const checkResults : Partial<Record<keyof typeof checks, boolean>> = {};
        for (const name of Object.keys(checks)) {
            const check = checks[name];
            const checkResult = check.check.call(this.context);

            checkResults[name as keyof T] = checkResult;

            if (!checkResult && (check.required ?? false)) {
                result = ChecklistResult.FAIL;
                break;
            } else if (!checkResult)
                result = Math.max(result, ChecklistResult.WARN);
        }

        return Object.assign(checkResults as Record<keyof T, boolean>, { result: result });
    }

}
