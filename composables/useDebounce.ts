import { ref, customRef } from 'vue';
import { debounce } from 'lodash-es';

export function useDebouncedRef<T>(value: T, delay = 200) {
    return customRef((track, trigger) => {
        const debouncedTrigger = debounce(trigger, delay);
        
        return {
            get() {
                track();
                return value;
            },
            set(newValue: T) {
                value = newValue;
                debouncedTrigger();
            }
        };
    });
}
