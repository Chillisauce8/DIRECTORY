<template>
    <section :class="sharedFunctions.prepareClasses('array')" :id="props.description.id">
        <template v-if="initDone && sharedFunctions.shouldBeConstructed(props.description)" v-show="!props.description.xHideValue">
            <div class="array-of-files-header">
                <h1 class="title array-of-object" v-if="props.description.title">
                    {{ sharedFunctions.getTitle() }}
                </h1>

                <Button icon="pi pi-plus" aria-label="Select Image" class="mr-2 mb-2" label="Select Image" v-if="!sharedFunctions.isReadonly()" @click="openSelectImageDialog()"> </Button>

                <Button icon="pi pi-times" aria-label="Delete Images" class="mr-2 mb-2" v-if="selectedFiled.length > 0" @click="removeSelectedImages()"> </Button>

                <Button label="Add" @click="fileDialog = true" />

                <Dialog v-model:visible="fileDialog" :style="{ width: '900px' }" header="File Details" :modal="true" class="p-fluid">
                    <!--        <div class="p-8 rounded-border flex flex-col border border-surface items-center gap-8"> -->
                    <div>
                        <FilesUpload @uploaded:file="onFileUploaded($event)"> </FilesUpload>
                    </div>

                    <template #footer>
                        <Button label="Close" icon="pi pi-times" @click="fileDialog = false" />
                    </template>
                </Dialog>

                <!--        <FileUpload mode="advanced" :multiple="true" :previewWidth="100" :maxFileSize="100000000"-->
                <!--                    label="Import" chooseLabel="Import" class="mr-2 inline-block"-->
                <!--                    customUpload @uploader="customUploader" @select="filesSelected">-->
                <!--          <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">-->
                <!--            <div class="flex flex-col gap-8 pt-4">-->
                <!--              <div v-if="files.length > 0">-->
                <!--                <h5>Pending</h5>-->
                <!--                <div class="flex flex-wrap gap-4">-->
                <!--                  <div v-for="(file, index) of files" :key="file.name + file.type + file.size"-->
                <!--                       class="p-8 rounded-border flex flex-col border border-surface items-center gap-4"-->
                <!--                       :fileKey="file.key = file.name + file.type + file.size">-->
                <!--                    <div v-if="fileHelperService.getFileType(file) === FileType.Image">-->
                <!--                      <img role="presentation" :alt="file.name" :src="file.objectURL"-->
                <!--                           :id="'img-' + file.name + file.type + file.size"-->
                <!--                           width="50" height="50" />-->
                <!--                    </div>-->

                <!--                    <FloatLabel>-->
                <!--                      <InputText :id="'name-' + file.name + file.type + file.size" type="text"-->
                <!--                                 v-model="filesMetadata.names[file.key]" required/>-->
                <!--                      <label :for="'name-' + file.name + file.type + file.size">File Name</label>-->
                <!--                    </FloatLabel>-->

                <!--                    <FloatLabel>-->
                <!--                      <InputText :id="'description-' + file.name + file.type + file.size" type="text"-->
                <!--                                 v-model="filesMetadata.descriptions[file.key]" maxlength="1000"/>-->
                <!--                      <label :for="'description-' + file.name + file.type + file.size">Description</label>-->
                <!--                    </FloatLabel>-->

                <!--                    <FloatLabel>-->
                <!--                      <Select id="'rating-' + file.name + file.type + file.size"-->
                <!--                                v-model="filesMetadata.ratings[file.key]" :options="ratingItems">-->
                <!--                      </Select>-->
                <!--                      <label :for="'rating-' + file.name + file.type + file.size">Rating</label>-->
                <!--                    </FloatLabel>-->

                <!--                    <span class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">-->
                <!--                          {{ file.name }}-->
                <!--                        </span>-->

                <!--                    <div>{{ formatSize(file.size) }}</div>-->

                <!--                    <Badge value="Pending" severity="warn" />-->
                <!--                    <Button icon="pi pi-times"-->
                <!--                            @click="onRemoveTemplatingFile(file, removeFileCallback, index)"-->
                <!--                            outlined rounded severity="danger" />-->
                <!--                  </div>-->
                <!--                </div>-->
                <!--              </div>-->
                <!--            </div>-->
                <!--          </template>-->
                <!--        </FileUpload>-->
            </div>

            <OrderList v-if="vm.model?.length" v-model="vm.model" dataKey="_id" breakpoint="575px" scrollHeight="20rem"
                       @update:selection="listSelectionChanged($event)">
                <template #item="{ item, index }">
                    <div class="flex flex-wrap p-1 items-center gap-4 w-full">
                        <template v-if="item.type === FileType.Image">
                            <ImageWrapper class="shrink-0 rounded" :id="item._id" :alt="item.name" :width="30"
                                          :height="30" dpr="1" :singleImage="true" />
                        </template>

                        <div class="flex flex-col">
                            <span class="font-medium text-sm">{{ item.name }}</span>
                            <span class="text-sm">{{ item.description }}</span>
                        </div>
                        <div v-if="item.rating" class="bg-surface-100 p-1" style="border-radius: 30px">
                            <div class="bg-surface-0 flex items-center gap-2 justify-center py-1 px-2" style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)">
                                <span class="text-surface-900 font-medium text-sm">{{ item.rating }}</span>
                                <i class="pi pi-star-fill text-yellow-500"></i>
                            </div>
                        </div>
                    </div>
                </template>
            </OrderList>

            <FieldError
                :validations="{
                    maxItems: sharedFunctions.isValidMaxItems,
                    minItems: sharedFunctions.isValidMinItems
                }"
                :messages="{
                    maxItems: `Max items value is ${props.description.xMaxItemsValue}`,
                    minItems: `Min items value is ${props.description.xMinItemsValue}`
                }"
            />
        </template>
    </section>
</template>

<script setup lang="ts">
import FieldError from '../FieldError.vue';
import useBaseArrayFieldControl from '~/composables/schema-forms/useBaseArrayFieldControl';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import { getCurrentInstance, ref } from 'vue';
import { filesService } from '~/service/file/files-service';
import { pick } from '~/service/utils';
import FileUpload from 'primevue/fileupload';
import { fileHelperService, FileType } from '~/service/file/file-helper-service';
import { usePrimeVue } from 'primevue/config';
import EXIF from '~/service/file/exif';
import { fileUploaderService } from '~/service/file/file-uploader-service';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const $primevue = usePrimeVue();

// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();

let { vm, sharedFunctions, initDone } = useBaseArrayFieldControl(props, emits);

const showSelectDialog = ref(false);

const filteredFiles = ref([]);

const selectedFiled = ref([]);

const fileDialog = ref(false);

// const filesMetadata = reactive({
//   names: {},
//   descriptions: {},
//   ratings: {},
// });

// const ratingItems = ref([0, 1, 2, 3, 4, 5]);

onMounted(async () => {
    loadFilteredFiles();

    const instance = getCurrentInstance();
    sharedFunctions.doOnMounted(instance);
});

async function loadFilteredFiles() {
    filteredFiles.value = await filesService.getFiles({ type: FileType.Image });
}

function openSelectImageDialog() {
    showSelectDialog.value = true;

    const modelIdList = vm.model.map((item: any) => item._id);

    if (filteredFiles.value) {
        for (const item of filteredFiles.value) {
            if (modelIdList.includes(item._id)) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        }
    }
}

function handleAddFiles() {
    showSelectDialog.value = false;

    const selectedFiles: any = filteredFiles.value.filter((item: any) => item.selected).map((item: any) => pick(item,
      ['_id', 'name', 'description', 'rating', 'type']));

    if (!vm.model) {
        vm.model = [];
    }

    const selectedFilesIdList = selectedFiles.map((item: any) => item._id);

    vm.model = vm.model.filter((item: any) => {
        if (selectedFilesIdList.includes(item._id)) {
            return true;
        }

        return false;
    });

    const modelIdList = vm.model.map((item: any) => item._id);

    for (const selectedFile of selectedFiles) {
        if (!modelIdList.includes(selectedFile._id)) {
            vm.model.push(selectedFile);
        }
    }
}

function listSelectionChanged($event: any[]) {
    const modelIdList = vm.model.map((item: any) => item._id);

    const value = $event.filter((item: any) => {
        if (modelIdList.includes(item._id)) {
            return true;
        }

        return false;
    });

    selectedFiled.value = value;
}

function removeSelectedImages() {
    const selectedFilesIdList = selectedFiled.value.map((item: any) => item._id);

    vm.model = vm.model.filter((item: any) => {
        if (selectedFilesIdList.includes(item._id)) {
            return false;
        }

        return true;
    });

    if (selectedFiled.value) {
        const modelIdList = vm.model.map((item: any) => item._id);

        const value = selectedFiled.value.filter((item: any) => {
            if (modelIdList.includes(item._id)) {
                return true;
            }

            return false;
        });

        selectedFiled.value = value;
    }
}

// for aspect ratio calculation
// function gcd(a: number, b: number) {
//   return (b == 0) ? a : gcd (b, a % b);
// }

//
// const customUploader = async (event: any) => {
//   for (const file of event.files) {
//
//     const data: any = await new Promise((resolve) => {
//       const type = fileHelperService.getFileType(file);
//       const extension = fileHelperService.getFileExtension(file.name);
//       const originalType = file.type || extension;
//
//       const medialProperties = fileHelperService.getMediaFileProperties(file);
//
//       let imgEl;
//       let imageInfo: any = {};
//
//       if (type === FileType.Image) {
//         imgEl = document.getElementById('img-' + file.name + file.type + file.size);
//
//         if (medialProperties.aspectRatio) {
//           imageInfo = {
//             width: medialProperties.width,
//             height: medialProperties.height,
//             aspectRatio: medialProperties.aspectRatio,
//           }
//         } else if (imgEl) {
//           const w = imgEl.naturalWidth;
//           const h = imgEl.naturalHeight;
//           const r = gcd(w, h);
//
//           const aspectRation = w/r + ":" + h/r;
//
//           imageInfo = {
//             width: w,
//             height: h,
//             aspectRation
//           }
//         }
//       }
//
//       const exif = new EXIF();
//       exif.getData(file, function () {
//
//         const metadata = exif.getAllTags(this);
//
//         const data: any = {
//           model: {
//             name: filesMetadata.names[file.key],
//             description: filesMetadata.descriptions[file.key],
//             rating: filesMetadata.ratings[file.key],
//             originalType,
//             type,
//             extension,
//             size: file.size,
//             imageInfo,
//             data: metadata,
//           },
//           file: file,
//         };
//
//         resolve(data);
//       });
//     });
//
//     const config: any = {
//       url: '/api/files',
//       data: data,
//       method: 'POST',
//       // headers: { [headerName: string]: string; },
//       // withCredentials: true,
//     }
//
//     const result = await fileUploaderService.upload(config);
//
//     if (result) {
//       const model = pick(result, ['_id', 'name', 'description', 'rating', 'type']);
//       vm.model.push(model);
//
//       loadFilteredFiles();
//
//       toast.add({severity: 'info', summary: 'Success', detail: `${data.model.name} Uploaded`, life: 3000});
//     } else {
//       toast.add({severity: 'error', summary: 'Error', detail: `${data.model.name} Upload Failed`, life: 3000});
//     }
//   }
//
//   toast.add({ severity: 'info', summary: 'Process finished', detail: 'Uploading finished', life: 3000 });
// };
//
//
// const filesSelected = async (event: {files: File[]}) => {
//   for (const file of event.files) {
//     const key = file.name + file.type + file.size;
//
//     if (filesMetadata.names[key] === undefined) {
//       filesMetadata.names[key] = file.name.split('.')[0];
//     }
//
//     if (filesMetadata.descriptions[key] === undefined) {
//       filesMetadata.descriptions[key] = '';
//     }
//
//     if (filesMetadata.ratings[key] === undefined) {
//       filesMetadata.ratings[key] = null;
//     }
//   }
// }
//
//
// const onRemoveTemplatingFile = (file: File, removeFileCallback: Function, index: number) => {
//   removeFileCallback(index);
// };
//

// const formatSize = (bytes) => {
//   const k = 1024;
//   const dm = 3;
//   const sizes = $primevue.config.locale.fileSizeTypes;
//
//   if (bytes === 0) {
//     return `0 ${sizes[0]}`;
//   }
//
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
//
//   return `${formattedSize} ${sizes[i]}`;
// };

function onFileUploaded(result) {
    if (result) {
        const model = pick(result, ['_id', 'name', 'description', 'rating', 'type']);
        vm.model.push(model);

        loadFilteredFiles();

        toast.add({ severity: 'info', summary: 'Success', detail: `${vm.model.name} Uploaded`, life: 3000 });
    }
}
</script>

<style lang="scss">
.select-image img {
    width: 200px;
    height: 200px;
}
</style>
