import {definePiniaStoreWithCache} from '~/services/store/define-pinia-store-with-cache';


interface IntersectedElementsStoreState {
    intersectedElementsIdList: string[];
}


export const useIntersectedElementsStore = definePiniaStoreWithCache('IntersectedElements', {
    state: (): IntersectedElementsStoreState => ({
        intersectedElementsIdList: [],
    }),
    getters: {

    },
    actions: {
        setIntersected(elementId: string): void {

            this.intersectedElementsIdList.push(elementId);
            this.intersectedElementsIdList = [...new Set(this.intersectedElementsIdList)];
        },
        resetIntersected(elementId): void {
            this.intersectedElementsIdList = this.intersectedElementsIdList.filter(id => id !== elementId);
        },
    },
});


export type IntersectedElementsStore = ReturnType<typeof useIntersectedElementsStore>;
