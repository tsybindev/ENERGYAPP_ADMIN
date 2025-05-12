import {z} from "zod";

export const CourseAddSchema = z.object({
    title: z.string().min(1, "Поле не должно быть пустым"),
})