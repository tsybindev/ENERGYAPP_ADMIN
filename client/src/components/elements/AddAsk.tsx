//@ts-ignore
//@ts-nocheck

import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/router";
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import {CourseAddSchema} from "@/lib/schemas/CourseAddSchema";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import {X} from "lucide-react";
import StoreCatalog from "@/lib/store/storeCatalog";
import {httpErrorsSplit} from "@/utils/httpErrorsSplit";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {createAsk} from "@/lib/api/Asks";
import Cookies from "js-cookie";

type ComponentProps = {
    module_id: string;
}

const AddAsk = ({...props}: ComponentProps) => {
    const router = useRouter()

    const methods = useForm<z.infer<typeof CourseAddSchema>>({
        resolver: zodResolver(CourseAddSchema),
        defaultValues: {}
    })

    const onSubmit: SubmitHandler<z.infer<typeof CourseAddSchema>> = async (data) => {
        const {title} = data

        const toastId = toast.loading('Создание вопроса...')

        const token = Cookies.get("users_access_token")
        try {

            const response = await createAsk(token, props.module_id, title)

            toast.success("Вопрос добавлен успешно!",
                {
                    id: toastId,
                    duration: 5000,
                    richColors: true,
                    action: (
                        <div className="absolute top-[10px] right-[10px]">
                            <X
                                size={16}
                                className="hover:text-red-500 cursor-pointer transition-all duration-300 ease-in-out"
                                onClick={() => toast.dismiss()}
                            />
                        </div>
                    ),
                })

            StoreCatalog.loading().then()
            await router.push(`/course/module/ask/${response.item_id}`)

        } catch (e) {
            toast.error(httpErrorsSplit(e),
                {
                    id: toastId,
                    duration: 5000,
                    richColors: true,
                    action: (
                        <div className="absolute top-[10px] right-[10px]">
                            <X
                                size={16}
                                className="hover:text-red-500 cursor-pointer transition-all duration-300 ease-in-out"
                                onClick={() => toast.dismiss()}
                            />
                        </div>
                    ),
                })
        }
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button>Добавить вопрос</Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Добавить вопрос</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <Form {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)} className="grid gap-4">
                            <FormField
                                control={methods.control}
                                name="title"
                                render={({field}) => (
                                    <FormItem className="grid gap-2">
                                        <FormLabel>Название вопроса</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                type={"text"}
                                                placeholder={"Название вопроса"}
                                                required
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full">
                               Добавить вопрос
                            </Button>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default AddAsk;