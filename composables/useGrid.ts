import type { DbNode, DbNodeIDFields } from '~/service/cars/dbNodeCRUD.service';
import { useDbNodeCRUDService } from '~/service/cars/dbNodeCRUD.service';

// Add Listing interface
interface Listing<T = any> extends Record<string, any> {
    _id: string;
    dbNode: T;
}

export interface GridConfig<DBNode extends DbNode = any> {
    collectionName: string;
    prepareListingItem?: (dbNode: DBNode) => Listing<DBNode>; // Made optional
    dbNodeList?: DBNode[];
    getDbNodeList?: () => Promise<DBNode[]>;
    createDbNode?: (dbNode: DBNode) => Promise<DBNode>;
    removeDbNode?: (dbNode: DBNode) => Promise<DBNode>;
    updateDbNode?: (dbNode: DBNode) => Promise<DBNode>;
}

export type GridCreateNodeFn = (dbNode: Omit<DbNode, DbNodeIDFields>) => Promise<DbNode>;
export type GridModifyNodeFn = (dbNode: DbNode) => Promise<DbNode>;

export const GridCreateNodeFn = Symbol('GridCreateNodeFn');
export const GridRemoveNodeFn = Symbol('GridRemoveNodeFn');
export const GridUpdateNodeFn = Symbol('GridUpdateNodeFn');

export async function useGrid<DBNode extends DbNode = any>(config: GridConfig<DBNode>) {
    const crudService = useDbNodeCRUDService();

    const {
        collectionName,
        dbNodeList,
        getDbNodeList = () => crudService.getList<DBNode>(collectionName),
        createDbNode = (dbNode: Omit<DBNode, DbNodeIDFields>) => crudService.create<DBNode>(collectionName, dbNode),
        updateDbNode = (dbNode: DBNode) => crudService.update<DBNode>(collectionName, dbNode),
        removeDbNode = (dbNode: DBNode) => crudService.delete<DBNode>(collectionName, dbNode)
    } = config;

    // This standard prepareListingItem now handles everything we need
    function prepareListingItem(dbNode: DBNode): Listing<DBNode> {
        return {
            ...dbNode, // Preserves all fields from MongoDB
            dbNode // Keeps original reference
        };
    }

    provide(GridCreateNodeFn, handleCreateNode);
    provide(GridUpdateNodeFn, handleUpdateNode);
    provide(GridRemoveNodeFn, handleDeleteNode);

    const nodeList = dbNodeList ?? (await getDbNodeList());
    const listingList = ref<Listing<DBNode>[]>(nodeList.map((n) => prepareListingItem(n)));

    function addDbNodeToListingList(dbNode: DBNode) {
        const listingNode = prepareListingItem(dbNode);

        listingList.value = [...listingList.value, listingNode] as Listing<DBNode>[];
    }

    function updateDbNodeInListingList(dbNode: DBNode) {
        listingList.value = listingList.value.map((l) => (l._id === dbNode._id ? prepareListingItem(dbNode) : l)) as Listing<DBNode>[];
    }

    function removeDbNodeFromListingList(dbNode: DBNode) {
        listingList.value = listingList.value.filter((l) => l._id !== dbNode._id);
    }

    async function handleCreateNode(dbNode: DBNode) {
        const createdNode = await createDbNode(dbNode);

        addDbNodeToListingList(createdNode);
    }

    async function handleUpdateNode(dbNode: DBNode) {
        const updatedNode = await updateDbNode(dbNode);

        updateDbNodeInListingList(updatedNode);
    }

    async function handleDeleteNode(dbNode: DBNode) {
        try {
            // Await and store the result
            const deletedNode = await removeDbNode(dbNode);
            if (!deletedNode) {
                throw new Error('Delete operation returned no response');
            }
            removeDbNodeFromListingList(dbNode);
            return deletedNode; // Make sure to return the deleted node
        } catch (error) {
            console.error('Delete failed in useGrid:', error);
            throw error;
        }
    }

    return {
        listingList,
        addDbNodeToListingList,
        updateDbNodeInListingList,
        removeDbNodeFromListingList,
        handleCreateNode,
        handleUpdateNode,
        handleDeleteNode
    };
}

export const useGridHandleCreateNodeFn = () => inject(GridCreateNodeFn) as GridCreateNodeFn;
export const useGridHandleUpdateNodeFn = () => inject(GridUpdateNodeFn) as GridModifyNodeFn;
export const useGridHandleRemoveNodeFn = () => inject(GridRemoveNodeFn) as GridModifyNodeFn;
