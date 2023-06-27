export interface AuthenticatedUser {
    readonly id: number
    readonly firstName: string
    readonly lastName: string
    readonly email: string
    readonly accessToken: string
    readonly salt: string
    // readonly otp: number
}