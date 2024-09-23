<script setup lang="ts">
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted } from 'vue';
import { usePrimeVue } from 'primevue/config';
import { ProductService } from '~/service/ProductService';
import { useToast } from 'primevue/usetoast';
import { fileHelperService, FileType } from '~/service/file/file-helper-service';
import EXIF from '~/service/file/exif';
import { fileUploaderService } from '~/service/file/file-uploader-service';
import { filesService } from '~/service/file/files-service';


const instance = getCurrentInstance();

const toast = useToast();
const $primevue = usePrimeVue();

const metrics = ref([]);
const files = ref([]);
const folders = ref([]);
const chartData = ref([]);
const chartOptions = ref({});
const chartPlugins = ref({});
const menuItems = ref([
  { label: 'View', icon: 'pi pi-search' },
  { label: 'Refresh', icon: 'pi pi-refresh' }
]);
const menuRef = ref(null);
const fileUploaderRef = ref(null);

const dbFiles = ref(null);
const fileDialog = ref(false);
const deleteFileDialog = ref(false);
const deleteFilesDialog = ref(false);
const currentFile = ref({});
const selectedFiles = ref(null);
const dt = ref(null);
const filters = ref({});
const submitted = ref(false);

const ratingItems = ref([0, 1, 2, 3, 4, 5]);

/*
const statuses = ref([
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' }
]);
*/
const productService = new ProductService();
/*
const getBadgeSeverity = (inventoryStatus) => {
    switch (inventoryStatus.toLowerCase()) {
        case 'instock':
            return 'success';
        case 'lowstock':
            return 'warning';
        case 'outofstock':
            return 'danger';
        default:
            return 'info';
    }
};
*/

onBeforeMount(() => {
  initFilters();
});

const loadAllFiles = () => {
  filesService.getFiles().then((data) => {
    dbFiles.value = data;
  });
}

onMounted(() => {
  loadAllFiles();
});

/*
const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const initChart = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    chartPlugins.value = [
        {
            beforeDraw: function (chart: any) {
                let ctx = chart.ctx;
                let width = chart.width;
                let height = chart.height;
                let fontSize = 1.5;
                let oldFill = ctx.fillStyle;
const openNew = () => {
    currentFile.value = {};
    submitted.value = false;
    fileDialog.value = true;
};
*/

const hideDialog = () => {
  fileDialog.value = false;
  submitted.value = false;
};

const editFile = (fileData: any) => {
  currentFile.value = { ...fileData };
  fileDialog.value = true;
};

const confirmDeleteFile = (fileData: any) => {
  currentFile.value = fileData;
  deleteFileDialog.value = true;
};

const deleteFile = async () => {
  try {
    await filesService.deleteFile(currentFile.value['_doc']);
    toast.add({ severity: 'success', summary: 'Successful', detail: 'File Deleted', life: 3000 });
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Problem to delete a file', life: 3000 });
  }

  deleteFileDialog.value = false;
  currentFile.value = {};

  loadAllFiles();
};

const findIndexById = (id: number) => {
  let index = -1;
  for (let i = 0; i < dbFiles.value.length; i++) {
    if (dbFiles.value[i].id === id) {
      index = i;
      break;
    }
  }
  return index;
};

// for aspect ratio calculation
function gcd(a: number, b: number) {
  return (b == 0) ? a : gcd (b, a % b);
}

const filesMetadata = reactive({
  names: {},
  descriptions: {},
  ratings: {},
});

const filesSelected = async (event: {files: File[]}) => {
  for (const file of event.files) {
    const key = file.name + file.type + file.size;

    if (filesMetadata.names[key] === undefined) {
      filesMetadata.names[key] = file.name.split('.')[0];
    }

    if (filesMetadata.descriptions[key] === undefined) {
      filesMetadata.descriptions[key] = '';
    }

    if (filesMetadata.ratings[key] === undefined) {
      filesMetadata.ratings[key] = null;
    }
  }
}

const customUploader = async (event: {files: File[]}) => {

  for (const file of event.files) {

    const data: any = await new Promise((resolve) => {
      const type = fileHelperService.getFileType(file);
      const extension = fileHelperService.getFileExtension(file.name);
      const originalType = file.type || extension;

      const medialProperties = fileHelperService.getMediaFileProperties(file);

      let imgEl;
      let imageInfo: any = {};

      if (type === FileType.Image) {
        imgEl = document.getElementById('img-' + file.name + file.type + file.size);

        if (medialProperties.aspectRatio) {
          imageInfo = {
            width: medialProperties.width,
            height: medialProperties.height,
            aspectRatio: medialProperties.aspectRatio,
          }
        } else if (imgEl) {
          const w = imgEl.naturalWidth;
          const h = imgEl.naturalHeight;
          const r = gcd (w, h);

          const aspectRation = w/r + ":" + h/r;

          imageInfo = {
            width: w,
            height: h,
            aspectRation
          }
        }
      }

      const exif = new EXIF();
      exif.getData(file, function () {

        const metadata = exif.getAllTags(this);

        const data: any = {
          model: {
            name: filesMetadata.names[file.key],
            description: filesMetadata.descriptions[file.key],
            rating: filesMetadata.ratings[file.key],
            originalType,
            type,
            extension,
            size: file.size,
            imageInfo,
            data: metadata,
          },
          file: file,
        };

        resolve(data);
      });
    });

    const config: any = {
      url: '/api/files',
      data: data,
      method: 'POST',
      // headers: { [headerName: string]: string; },
      // withCredentials: true,
    }

    const result = await fileUploaderService.upload(config);

    if (result) {
      toast.add({severity: 'info', summary: 'Success', detail: `${data.model.name} Uploaded`, life: 3000});
    } else {
      toast.add({severity: 'error', summary: 'Error', detail: `${data.model.name} Upload Failed`, life: 3000});
    }
  }

  toast.add({ severity: 'info', summary: 'Process finished', detail: 'Uploading finished', life: 3000 });

  loadAllFiles();
};


// async function onFileChanged(event: {files: File[]}) {
//
// }

const toggleMenuItem = (event: any, index: number) => {
  menuRef.value[index].toggle(event);
}

/*
const exportCSV = () => {
    dt.value.exportCSV();
};
*/

const confirmDeleteSelected = () => {
  deleteFilesDialog.value = true;
};

const deleteSelectedFiles = async () => {
  for (const selectedFile of selectedFiles.value) {
    await filesService.deleteFile(selectedFile._doc);
  }

  deleteFilesDialog.value = false;
  selectedFiles.value = null;
  toast.add({ severity: 'success', summary: 'Successful', detail: 'Files Deleted', life: 3000 });

  loadAllFiles();
};

// const onSelectedFiles = (event: any) => {
//     uploadFiles.value = event.files;
// };

// const onRemoveFile = (removeFile) => {
//     uploadFiles.value = uploadFiles.value.filter((file) => file.name !== removeFile.name);
// };

// const formatSize = (bytes: number) => {
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

const onRemoveTemplatingFile = (file: File, removeFileCallback: Function, index: number) => {
  removeFileCallback(index);
  // totalSize.value -= parseInt(formatSize(file.size));
  // totalSizePercent.value = totalSize.value / 10;
};


const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  };
}


let dataToSave: any;
let saveDataFunc: Function;

function dataChanged(result: {data: any, saveDataFunc: (data: any) => Promise<void>}) {
  dataToSave = result.data;
  saveDataFunc = result.saveDataFunc;
}

async function updateFile() {
  return saveDataFunc(dataToSave);
}

const formatSize = (bytes) => {
  const k = 1024;
  const dm = 3;
  const sizes = $primevue.config.locale.fileSizeTypes;

  if (bytes === 0) {
    return `0 ${sizes[0]}`;
  }

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${formattedSize} ${sizes[i]}`;
};

</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <Toolbar class="mb-4">
          <template v-slot:start>
            <div class="my-2">
              <!--         <Button label="New" icon="pi pi-plus" class="mr-2" severity="success" @click="openNew" /> -->
              <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"
                      :disabled="!selectedFiles || !selectedFiles.length" />
              <!--                            <Button label="Select" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"-->
              <!--                                    :disabled="!selectedFiles || !selectedFiles.length" />-->
            </div>
          </template>

          <template v-slot:end>
            <FileUpload mode="advanced" :multiple="true" :previewWidth="100" :maxFileSize="100000000"
                        label="Import" chooseLabel="Import" class="mr-2 inline-block"
                        customUpload @uploader="customUploader" @select="filesSelected">
              <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
                <div class="flex flex-col gap-8 pt-4">
                  <div v-if="files.length > 0">
                    <h5>Pending</h5>
                    <div class="flex flex-wrap gap-4">
                      <div v-for="(file, index) of files" :key="file.name + file.type + file.size"
                           class="p-8 rounded-border flex flex-col border border-surface items-center gap-4"
                           :fileKey="file.key = file.name + file.type + file.size">
                        <div>
                          <img role="presentation" :alt="file.name" :src="file.objectURL"
                               :id="'img-' + file.name + file.type + file.size"
                               width="100" height="50" />
                        </div>

                        <FloatLabel>
                          <InputText :id="'name-' + file.name + file.type + file.size" type="text"
                                     v-model="filesMetadata.names[file.key]" required/>
                          <label :for="'name-' + file.name + file.type + file.size">File Name</label>
                        </FloatLabel>

                        <FloatLabel>
                          <InputText :id="'description-' + file.name + file.type + file.size" type="text"
                                     v-model="filesMetadata.descriptions[file.key]" maxlength="1000"/>
                          <label :for="'description-' + file.name + file.type + file.size">Description</label>
                        </FloatLabel>

                        <FloatLabel>
                          <Dropdown id="'rating-' + file.name + file.type + file.size"
                                    v-model="filesMetadata.ratings[file.key]" :options="ratingItems">
                          </Dropdown>
                          <label :for="'rating-' + file.name + file.type + file.size">Rating</label>
                        </FloatLabel>

                        <span class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">
                          {{ file.name }}
                        </span>

                        <div>{{ formatSize(file.size) }}</div>

                        <Badge value="Pending" severity="warn" />
                        <Button icon="pi pi-times"
                                @click="onRemoveTemplatingFile(file, removeFileCallback, index)"
                                outlined rounded severity="danger" />
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </FileUpload>
            <!--    <Button label="Export" icon="pi pi-upload" severity="help" @click="exportCSV($event)" /> -->
          </template>
        </Toolbar>

        <DataTable
          ref="dt"
          :value="dbFiles"
          v-model:selection="selectedFiles"
          dataKey="_doc"
          :paginator="true"
          :rows="10"
          :filters="filters"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} files"
        >
          <template #header>
            <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
              <h5 class="m-0">Manage Files</h5>
              <IconField iconPosition="left" class="block mt-2 md:mt-0">
                <InputIcon class="pi pi-search" />
                <InputText class="w-full sm:w-auto" v-model="filters['global'].value" placeholder="Search..." />
              </IconField>
            </div>
          </template>

          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <!-- <Column field="code" header="Code" :sortable="true" headerStyle="width:14%; min-width:10rem;">
              <template #body="slotProps">
                  <span class="p-column-title">Code</span>
                  {{ slotProps.data.code }}
              </template>
          </Column>
      -->
          <Column header="Image" headerStyle="width:14%; min-width:10rem;">
            <template #body="slotProps">
              <span class="p-column-title">Image</span>
              <ImageWrapper
                :cloudinaryId="slotProps.data._doc"
                :alt="slotProps.data.description"
                :width="100"
                class="image-preview">
              </ImageWrapper>
            </template>
          </Column>
          <Column field="name" header="Name" :sortable="true" headerStyle="width:14%; min-width:10rem;">
            <template #body="slotProps">
              <span class="p-column-title">Name</span>
              {{ slotProps.data.name }}
            </template>
          </Column>
          <Column field="description" header="Description" :sortable="true" headerStyle="width:14%; min-width:10rem;">
            <template #body="slotProps">
              <span class="p-column-title">Name</span>
              {{ slotProps.data.description }}
            </template>
          </Column>

          <!--
          <Column field="price" header="Price" :sortable="true" headerStyle="width:14%; min-width:8rem;">
              <template #body="slotProps">
                  <span class="p-column-title">Price</span>
                  {{ formatCurrency(slotProps.data.price) }}
              </template>
          </Column>
      -->
          <Column field="type" header="Type" :sortable="true" headerStyle="width:14%; min-width:10rem;">
            <template #body="slotProps">
              <span class="p-column-title">Type</span>
              {{ slotProps.data.type }}
            </template>
          </Column>
          <Column field="extension" header="Extension" :sortable="true" headerStyle="width:14%; min-width:10rem;">
            <template #body="slotProps">
              <span class="p-column-title">Extension</span>
              {{ slotProps.data.extension }}
            </template>
          </Column>
          <Column field="dateAdded" header="Added" :sortable="true" headerStyle="width:14%; min-width:10rem;">
            <template #body="slotProps">
              <span class="p-column-title">Added</span>
              {{ slotProps.data.created.date }}
            </template>
          </Column>
          <Column field="rating" header="Rating" :sortable="true" headerStyle="width:14%; min-width:10rem;">
            <template #body="slotProps">
              <span class="p-column-title">Rating</span>
              <Rating :modelValue="slotProps.data.rating" :readonly="true" :cancel="false" />
            </template>
          </Column>
          <!--
          <Column field="inventoryStatus" header="Status" :sortable="true" headerStyle="width:14%; min-width:10rem;">
              <template #body="slotProps">
                  <span class="p-column-title">Status</span>
                  <Tag :severity="getBadgeSeverity(slotProps.data.inventoryStatus)">{{ slotProps.data.inventoryStatus }}</Tag>
              </template>
          </Column>
      -->
          <Column headerStyle="min-width:10rem;">
            <template #body="slotProps">
              <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editFile(slotProps.data)" />
              <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteFile(slotProps.data)" />
            </template>
          </Column>
        </DataTable>

        <Dialog v-model:visible="fileDialog" :style="{ width: '450px' }" header="File Details" :modal="true"
                class="p-fluid">

          <DataItem
            v-if="currentFile"
            collection="files"
            function="update"
            @changed="dataChanged($event)"
            :id="currentFile?._doc">
          </DataItem>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" @click="updateFile" />
          </template>
        </Dialog>

        <Dialog v-model:visible="deleteFileDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="currentFile">Are you sure you want to delete <b>{{ currentFile.name }}</b>?</span>
          </div>
          <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deleteFileDialog = false" />
            <Button label="Yes" icon="pi pi-check" text @click="deleteFile" />
          </template>
        </Dialog>

        <Dialog v-model:visible="deleteFilesDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
            <span v-if="selectedFiles">Are you sure you want to delete the selected files?</span>
          </div>
          <template #footer>
            <Button label="No" icon="pi pi-times" text @click="deleteFilesDialog = false" />
            <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedFiles" />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<style>
.images.image-preview {
  width: 100px;
  height: 100px;
}
</style>
