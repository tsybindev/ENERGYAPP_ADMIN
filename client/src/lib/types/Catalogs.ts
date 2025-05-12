export type Catalog = {
    item_id: string;
    title: string;
    modules?: CatalogModule[];
}

export type CatalogModule = {
    item_id: string;
    title: string;
    lessons: CatalogModuleLesson[];
    asks: CatalogModuleAsk[];
}

export type CatalogModuleLesson = {
    item_id: string;
    title: string;
}

export type CatalogModuleAsk = {
    item_id: string;
    title: string;
    answers: CatalogModuleAskAnswer[];
}

export type CatalogModuleAskAnswer = {
    item_id: string;
    title: string;
}