import fs from 'fs';
import path from 'path';
import { defineEventHandler } from 'h3';

export default defineEventHandler(() => {
    const iconsDir = path.join(process.cwd(), 'public/icons');
    console.log('Icons directory:', iconsDir); // Log the directory path

    try {
        const files = fs.readdirSync(iconsDir);
        const icons = files.filter((file) => file.endsWith('.svg')).map((file) => file.replace('.svg', ''));
        console.log('Icons found:', icons); // Log found icons
        return icons;
    } catch (error) {
        console.error('Error reading icons directory:', error);
        return [];
    }
});
