export interface Message {
    id: string;
    from?: string;
    to?: string;
    title?: string;
    message?: string;
    date: string;
    image?: string;
    sent: boolean;
    archived: boolean;
    trash: boolean;
    spam: boolean;
    starred: boolean;
    important: boolean;
}
