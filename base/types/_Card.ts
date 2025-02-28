// Base interface for card data
export interface _Card {
    clickable: boolean; // Remove optional (?) to ensure it's always defined
    searchTerms?: string;
    collection: string;
}
