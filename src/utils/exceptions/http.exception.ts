class HttpException extends Error {
    public status: number
    public message: string
    public code: string

    constructor(status: number, message: string, code: string) {
        super(message)
        this.status = status
        this.message = message
        this.code = code
    }
}

export default HttpException