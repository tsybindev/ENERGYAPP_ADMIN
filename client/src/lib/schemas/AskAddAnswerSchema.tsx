import {z} from "zod";

export const AskAddAnswerSchema = z.object({
    answers: z.array(
        z.object({
            title: z.string(),
            is_input: z.boolean(),
            is_true: z.boolean(),
        })
    ),
})