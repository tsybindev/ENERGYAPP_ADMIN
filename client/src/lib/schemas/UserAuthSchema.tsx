import {z} from "zod";

export const UserAuthSchema = z.object({
    email: z.string().min(1, "Поле не должно быть пустым"),
    password: z.string().min(1, "Поле не должно быть пустым"),
})