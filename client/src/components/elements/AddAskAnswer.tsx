//@ts-ignore
//@ts-nocheck

import React, {useEffect} from 'react';
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "sonner";
import Cookies from "js-cookie";
import {X} from "lucide-react";
import {AskAddAnswerSchema} from "@/lib/schemas/AskAddAnswerSchema";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {editAsk} from "@/lib/api/Asks";
import StoreAsks from "@/lib/store/storeAsks";
import {observer} from "mobx-react";

type ComponentProps = {
    module_id: string;
    title: string;
    ask_id: string;
}

const AddAskAnswer = observer(({...props}: ComponentProps) => {
    const methods = useForm({
        resolver: zodResolver(AskAddAnswerSchema),
        defaultValues: {
            answers: [
                {
                    title: "",
                    is_input: false,
                    is_true: false,
                },
            ],
        },
    });

    // Подтягиваем данные из StoreAsks и обновляем форму при изменении данных
    useEffect(() => {
        const loadData = async () => {
            await StoreAsks.getAsk(props.ask_id);  // Загружаем данные по ask_id
            if (StoreAsks.ask) {
                const answers = StoreAsks.ask.answers || [];  // Пример: предполагаем, что данные в ask содержат поле answers
                methods.reset({ answers });  // Обновляем значения формы с помощью reset
            }
        };

        loadData();
    }, [props.ask_id, methods]);

    const onSubmit: SubmitHandler<z.infer<typeof AskAddAnswerSchema>> = async (data) => {
        const { answers } = data;

        // Преобразование данных, чтобы привести к нужному формату
        const formattedAnswers = answers.map((answer) => ({
            title: answer.title,
            is_input: answer.is_input,
            is_true: answer.is_true,
        }));

        const toastId = toast.loading('Отправка данных...');

        try {
            const token = Cookies.get('users_access_token');
            await editAsk(token, props.module_id, props.ask_id, props.title, Boolean(answers[0]?.is_input), formattedAnswers);

            toast.success("Ответы успешно отправлены!", {
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
            });
        } catch (e) {
            toast.error('Ошибка при отправке данных', {
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
            });
        }
    };

    const handleRemoveAnswer = (index: number) => {
        const currentAnswers = methods.getValues("answers");
        const updatedAnswers = currentAnswers.filter((_, i) => i !== index);
        methods.setValue("answers", updatedAnswers);
    };

    return (
        <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="grid gap-4">
                {/* Ответы */}
                {methods.watch("answers")?.map((_, index) => (
                    <div key={index} className="grid gap-4">
                        {/* Название ответа */}
                        <FormField
                            control={methods.control}
                            name={`answers[${index}].title`}
                            render={({ field }) => (
                                <FormItem className="grid gap-2">
                                    <FormLabel>Ответ {index + 1} - Название</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Введите название ответа"
                                            required
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Переключатель для is_input */}
                        <FormField
                            control={methods.control}
                            name={`answers[${index}].is_input`}
                            render={({ field }) => (
                                <FormItem className="grid gap-2">
                                    <FormLabel>Это вводимый ответ?</FormLabel>
                                    <FormControl>
                                        <Switch
                                            {...field}
                                            checked={field.value}
                                            onCheckedChange={(checked) => field.onChange(checked)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Переключатель для is_true */}
                        <FormField
                            control={methods.control}
                            name={`answers[${index}].is_true`}
                            render={({ field }) => (
                                <FormItem className="grid gap-2">
                                    <FormLabel>Это правильный ответ?</FormLabel>
                                    <FormControl>
                                        <Switch
                                            {...field}
                                            checked={field.value}
                                            onCheckedChange={(checked) => field.onChange(checked)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Кнопка для удаления ответа */}
                        <Button
                            type="button"
                            className="w-full mt-2 bg-red-500"
                            onClick={() => handleRemoveAnswer(index)}
                        >
                            Удалить ответ
                        </Button>
                    </div>
                ))}

                {/* Кнопка для добавления нового ответа, если is_input - false */}
                {!methods.watch("answers")?.[0]?.is_input && (
                    <Button
                        type="button"
                        className="w-full"
                        onClick={() => methods.setValue('answers', [...methods.getValues('answers'), { title: '', is_input: false, is_true: false }])}
                    >
                        Добавить ответ
                    </Button>
                )}

                <Button type="submit" className="w-full">
                    Сохранить
                </Button>
            </form>
        </Form>
    );
});

export default AddAskAnswer;