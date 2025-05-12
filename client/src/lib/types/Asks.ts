export type Asks = {
    title: string;
    content: {};
    is_input: boolean;
    answers: Answer[];
    item_id: string;
    module_id: string;
    course_id: string;
}

export type Answer = {
    content: {};
    title: string;
    is_input: boolean;
    is_true: boolean;
}