export interface SignUpDto {
    firstName: string
    lastName: string
    email: string 
    mobile: string
    nic: string
    sponsor: string 
    username: string 
    password: string 
    profilePic: string
}

export interface SignInDto {
    username: string
    password: string
}