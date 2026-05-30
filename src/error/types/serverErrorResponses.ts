export class ProblemDetail extends Error {
    title: string
    status: number
    detail: string
    timestamp: Date
    fieldErrors: FieldError[]
    
    constructor(title: string, status: number, detail: string, timestamp: Date, fieldErrors: FieldError[]) {
        super(detail);
        this.title = title;
        this.status = status;
        this.detail = detail;
        this.timestamp = timestamp
        this.fieldErrors = fieldErrors
        this.name = "ProblemDetail";
    }
}

export interface FieldError {
    field: string
    defaultMessage: string
    rejectedValue: string
}

export class ValidationError extends ProblemDetail {
    
    constructor(problem: ProblemDetail) {
        super(problem.title, problem.status, problem.detail, problem.timestamp, problem.fieldErrors)
    }
}