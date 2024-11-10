import { defineEventHandler } from 'h3';

export default defineEventHandler(() => {
    return { message: 'Test route is working!' };
});
