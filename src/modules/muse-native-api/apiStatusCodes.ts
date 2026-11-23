export enum APIStatusCodes {
    redirect = 302,
    forbidden = 403,
    notFound = 404,
    requiredAttestation = 415,
    validationError = 422,
    updateClient = 426,
    rateLimit = 429,
    serverError = 500,
}

export enum HandledAPIStatusCodes {
    notAthorized = 401,
    needAttestation = 415,
    updateServerTime = 498,
    repeatRequest = 429,
}
