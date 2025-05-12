import {AxiosError} from "axios";

export const httpErrorsSplit = (e: unknown) => {
    const error = e as AxiosError
    const errorList = error?.response?.data as {
        errors: {
            msg: string,
            code: number
        }[]
    }
    if (!error || !errorList?.errors || !Array.isArray(errorList.errors) || errorList.errors.length === 0) return 'Неизвестная ошибка'
    return errorList.errors.map(el => el.msg).join(', ')
}