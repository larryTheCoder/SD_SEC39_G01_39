export interface ValidationInput {
    length: boolean,
    hasUppercase: boolean,
    hasLowercase: boolean,
    hasDigit: boolean,
    hasSpecial: boolean,
    isMatched: boolean
}

export function onPasswordChange(
    passChange: string,
    state: number,
    validate: ValidationInput,
    password: string,
    confirmPassword: string,
    setPassword: (e: string) => void,
    setConfirmPassword: (e: string) => void,
    setValidation: (e: ValidationInput) => void,
    setAllowed: (e: boolean) => void
) {
    if (state === 0) {
        setPassword(passChange)
    } else if (state === 1) {
        setConfirmPassword(passChange)
    }

    let validPassword = (/.{8,}/).test(passChange)
    let length = validate.length
    let hasUppercase = validate.hasUppercase
    let hasLowercase = validate.hasLowercase
    let hasDigit = validate.hasDigit
    let hasSpecial = validate.hasSpecial
    let isMatched = validate.isMatched

    if (state === 0) {
        length = (/.{8,}/).test(passChange)
        hasUppercase = (/(?=.*?[A-Z])/).test(passChange)
        hasLowercase = (/(?=.*?[a-z])/).test(passChange)
        hasDigit = (/(?=.*?[0-9])/).test(passChange)
        hasSpecial = (/(?=.*?[#?!@$%^&*\-])/).test(passChange)
        isMatched = passChange === confirmPassword

        setValidation({
            ...validate,
            length: length,
            hasUppercase: hasUppercase,
            hasLowercase: hasLowercase,
            hasDigit: hasDigit,
            hasSpecial: hasSpecial,
            isMatched: isMatched
        })
    } else if (state === 1) {
        isMatched = passChange === password

        setValidation({
            ...validate,
            isMatched: isMatched
        })
    }

    setAllowed(validPassword && length && hasUppercase && hasLowercase && hasDigit && hasSpecial && isMatched)
}
