<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePrimeVue } from 'primevue/config';
import { FileService } from '~/service/FileService';
import { fileHelperService } from '~/service/file/file-helper-service';
import EXIF from '~/service/file/exif';
import { fileUploaderService } from '~/service/file/file-uploader-service';


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

onMounted(() => {
    const fileService = new FileService();
    fileService.getFiles().then((data) => (files.value = data));
    fileService.getMetrics().then((data) => (metrics.value = data));
    fileService.getFoldersLarge().then((data) => (folders.value = data));
    initChart();
});

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

                ctx.restore();
                ctx.font = fontSize + 'rem sans-serif';
                ctx.textBaseline = 'middle';

                let text = 'Free Space';
                let text2 = 50 + 'GB / ' + 80 + 'GB';
                let textX = Math.round((width - ctx.measureText(text).width) / 2);
                let textY = (height + chart.chartArea.top) / 2.25;

                let text2X = Math.round((width - ctx.measureText(text).width) / 2.1);
                let text2Y = (height + chart.chartArea.top) / 1.75;

                ctx.fillStyle = chart.config.data.datasets[0].backgroundColor[0];
                ctx.fillText(text, textX, textY);
                ctx.fillText(text2, text2X, text2Y);
                ctx.fillStyle = oldFill;
                ctx.save();
            }
        }
    ];
    chartData.value = {
        datasets: [
            {
                data: [300, 100],
                backgroundColor: [documentStyle.getPropertyValue('--primary-600'), documentStyle.getPropertyValue('--primary-100')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--primary-700'), documentStyle.getPropertyValue('--primary-200')],
                borderColor: 'transparent',
                fill: true
            }
        ]
    };

    chartOptions.value = {
        animation: {
            duration: 0
        },
        responsive: true,
        maintainAspectRatio: false,
        cutout: '90%',
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        }
    };
};


const customUploader = async (event: {files: File[]}) => {

  for (const file of event.files) {

    const data = await new Promise((resolve) => {
      const type = fileHelperService.getFileType(file);
      const originalType = file.type || fileHelperService.getFileExtension(file.name);

      const exif = new EXIF();
      exif.getData(file, function () {

        const metadata = exif.getAllTags(this);

        const data = {
          model: {
            name: file.name,
            originalType,
            type,
            size: file.size,
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
};


async function onFileChanged(event: {files: File[]}) {

}

const toggleMenuItem = (event: any, index: number) => {
    menuRef.value[index].toggle(event);
};

const onChooseUploadFiles = () => {
    fileUploaderRef.value.choose();
};

// const onSelectedFiles = (event: any) => {
//     uploadFiles.value = event.files;
// };

// const onRemoveFile = (removeFile) => {
//     uploadFiles.value = uploadFiles.value.filter((file) => file.name !== removeFile.name);
// };

const formatSize = (bytes: number) => {
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

// const onRemoveTemplatingFile = (file: File, removeFileCallback: Function, index: number) => {
//   removeFileCallback(index);
//   totalSize.value -= parseInt(formatSize(file.size));
//   totalSizePercent.value = totalSize.value / 10;
// };

</script>

<template>
    <div class="grid">
        <!--
        <div v-for="(metric, i) in metrics" :key="i" class="col-12 md:col-6 lg:col-3">
            <div class="card h-full">
                <div class="flex align-items-center justify-content-between mb-3">
                    <span class="text-900 text-xl font-semibold">{{ metric.title }}</span>
                    <div>
                        <Button @click="toggleMenuItem($event, i)" :icon="metric.icon" size="small" text rounded></Button>
                        <Menu ref="menuRef" popup :model="menuItems"></Menu>
                    </div>
                </div>
                <div>
                    <div class="border-round" :class="metric.color" :style="{ height: '6px' }">
                        <div class="h-full border-round" :class="metric.fieldColor" :style="{ width: '34%' }"></div>
                    </div>
                    <div class="flex align-item-center justify-content-between">
                        <span class="text-900 mt-3 text-md font-medium">{{ metric.files }}</span>
                        <span class="text-900 mt-3 text-md font-medium">{{ metric.fileSize }}</span>
                    </div>
                </div>
            </div>
        </div>
    -->
        <!--
        <div class="col-12 md:col-5 xl:col-3">

            <div class="card">
                <div class="text-900 text-xl font-semibold mb-3">Account Storage</div>
                <div class="flex flex-row justify-content-center" style="height: 200px">
                    <Chart type="doughnut" :plugins="chartPlugins" :data="chartData" :options="chartOptions"></Chart>
                </div>
                <div class="mt-5 flex gap-3">
                    <Button icon="pi pi-search" class="flex-1" label="Details" outlined></Button>
                    <Button icon="pi pi-upload" class="flex-1" label="Upgrade"></Button>
                </div>
            </div>

            <div class="card">
                <div class="text-900 text-xl font-semibold mb-3">Categories</div>
                <ul class="list-none p-0 m-0">
                    <li class="p-3 mb-3 flex align-items-center justify-content-between cursor-pointer border-round bg-indigo-50 text-indigo-900">
                        <div class="flex align-items-center">
                            <i class="pi pi-image text-2xl mr-3"></i>
                            <span class="ext-lg font-medium">Images</span>
                        </div>
                        <span class="text-lg font-bold">85</span>
                    </li>
                    <li class="p-3 mb-3 flex align-items-center justify-content-between cursor-pointer border-round bg-purple-50 text-purple-900">
                        <div class="flex align-items-center">
                            <i class="pi pi-file text-2xl mr-3"></i>
                            <span class="ext-lg font-medium">Documents</span>
                        </div>
                        <span class="text-lg font-bold">231</span>
                    </li>
                    <li class="p-3 flex align-items-center justify-content-between cursor-pointer border-round bg-teal-50 text-teal-900">
                        <div class="flex align-items-center">
                            <i class="pi pi-video text-2xl mr-3"></i>
                            <span class="ext-lg font-medium">Videos</span>
                        </div>
                        <span class="text-lg font-bold">40</span>
                    </li>
                </ul>
            </div>

            <div class="card p-0">
                <div class="card">
                    <FileUpload
                        ref="fileUploaderRef"
                        id="files-fileupload"
                        name="demo[]"
                        url="./upload.php"
                        accept="image/*"
                        customUpload
                        multiple
                        auto
                        class="upload-button-hidden w-full"
                        invalidFileSizeMessage="Invalid File Size"
                        invalidFileTypeMessage="Invalid File Type"
                        :maxFileSize="1000000"
                        @select="onSelectedFiles"
                        :pt="{
                            buttonbar: { class: 'hidden' },
                            content: { class: 'border-none' }
                        }"
                    >
                        <template #content>
                            <div v-if="uploadFiles.length > 0" class="w-full py-3" :style="{ cursor: 'copy' }">
                                <div v-for="file in uploadFiles" :key="file.name" class="flex flex-wrap gap-5">
                                    <div class="remove-file-wrapper h-full relative w-7rem h-7rem border-3 border-transparent border-round hover:bg-primary transition-duration-100 cursor-auto" :style="{ padding: '1px' }">
                                        <img :src="file.objectURL" :alt="file.name" class="w-full h-full border-round shadow-2" />
                                        <Button
                                            icon="pi pi-times"
                                            class="remove-button text-sm absolute justify-content-center align-items-center cursor-pointer"
                                            rounded
                                            :style="{ top: '-10px', right: '-10px', display: 'none' }"
                                            @click="onRemoveFile(file)"
                                        ></Button>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template #empty>
                            <div v-if="uploadFiles.length < 1" @click="onChooseUploadFiles" class="w-full py-3" :style="{ cursor: 'copy' }">
                                <div class="h-full flex flex-column justify-content-center align-items-center">
                                    <i class="pi pi-upload text-900 text-2xl mb-3"></i>
                                    <span class="font-bold text-900 text-xl mb-3">Upload Files</span>
                                    <span class="font-medium text-600 text-md text-center">Drop or select files</span>
                                </div>
                            </div>
                        </template>
                    </FileUpload>
                </div>
            </div>
        </div>
    -->
        <div class="card col-12">
            <div class="text-900 text-xl font-semibold mb-3">Categories</div>
            <ul class="list-none p-0 m-0">
                <li class="p-3 mb-3 flex align-items-center justify-content-between cursor-pointer border-round bg-indigo-50 text-indigo-900">
                    <div class="flex align-items-center">
                        <i class="pi pi-image text-2xl mr-3"></i>
                        <span class="ext-lg font-medium">Images</span>
                    </div>
                    <span class="text-lg font-bold">85</span>
                </li>
                <li class="p-3 mb-3 flex align-items-center justify-content-between cursor-pointer border-round bg-purple-50 text-purple-900">
                    <div class="flex align-items-center">
                        <i class="pi pi-file text-2xl mr-3"></i>
                        <span class="ext-lg font-medium">Documents</span>
                    </div>
                    <span class="text-lg font-bold">231</span>
                </li>
                <li class="p-3 flex align-items-center justify-content-between cursor-pointer border-round bg-teal-50 text-teal-900">
                    <div class="flex align-items-center">
                        <i class="pi pi-video text-2xl mr-3"></i>
                        <span class="ext-lg font-medium">Videos</span>
                    </div>
                    <span class="text-lg font-bold">40</span>
                </li>
            </ul>
        </div>
        <div class="col-12 field">
            <label for="demo[]" class="text-900 font-semibold">Add Files</label>
            <FileUpload name="demo[]" customUpload @uploader="customUploader" :multiple="true"
                        :maxFileSize="1000000"
                        @select="onFileChanged($event)">
                <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
                  <div class="flex flex-col gap-8 pt-4">
                    <div v-if="files.length > 0">
                      <h5>Pending</h5>
                      <div class="flex flex-wrap gap-4">
                        <div v-for="(file, index) of files" :key="file.name + file.type + file.size"
                             class="p-8 rounded-border flex flex-col border border-surface items-center gap-4">
                          <div>
                            <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
                          </div>
                          <span class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">
                            {{ file.name }}
                          </span>
                          <div>{{ formatSize(file.size) }}</div>
                          <Badge value="Pending" severity="warn" />
                          <Button icon="pi pi-times" @click="removeFileCallback" outlined rounded severity="danger" />
                        </div>
                      </div>
                    </div>

                    <div v-if="uploadedFiles.length > 0">
                      <h5>Completed</h5>
                      <div class="flex flex-wrap gap-4">
                        <div v-for="(file, index) of uploadedFiles" :key="file.name + file.type + file.size"
                             class="p-8 rounded-border flex flex-col border border-surface items-center gap-4">
                          <div>
                            <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
                          </div>
                          <span class="font-semibold text-ellipsis max-w-60 whitespace-nowrap overflow-hidden">
                            {{ file.name }}
                          </span>
                          <div>{{ formatSize(file.size) }}</div>
                          <Badge value="Completed" class="mt-4" severity="success" />
                          <Button icon="pi pi-times" @click="removeUploadedFileCallback(index)" outlined rounded severity="danger" />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <template #empty>
                    <p>Drag and drop files to here to upload.</p>
                </template>
            </FileUpload>
        </div>
        <div class="col-12">
            <!--   <div class="card">
                <div class="text-900 text-xl font-semibold mb-3">Folders</div>
                <div class="grid">
                    <div v-for="(folder, i) in folders" :key="i" class="col-12 md:col-6 xl:col-4">
                        <div class="p-3 border-1 surface-border flex align-items-center justify-content-between hover:surface-100 cursor-pointer border-round">
                            <div class="flex align-items-center">
                                <i class="text-2xl mr-3" :class="folder.icon"></i>
                                <span class="text-900 text-lg font-medium">{{ folder.name }}</span>
                            </div>
                            <span class="text-600 text-lg font-semibold">{{ folder.size }}</span>
                        </div>
                    </div>
                </div>
            </div> -->
            <div class="card">
                <div class="text-900 text-xl font-semibold mb-3">Recent Uploads</div>
                <DataTable :value="files" dataKey="id" paginator :rows="8">
                    <Column field="name" header="Name" sortable :headerStyle="{ minWidth: '12rem' }">
                        <template #body="{ data }">
                            <div class="flex align-items-center">
                                <i class="text-xl text-primary mr-2" :class="data.icon"></i>
                                <span>{{ data.name }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="date" header="Date" headerClass="white-space-nowrap" :headerStyle="{ minWidth: '12rem' }"> </Column>
                    <Column field="fileSize" header="File Size" sortable :headerStyle="{ minWidth: '12rem' }"></Column>
                    <Column class="w-10rem">
                        <template #body>
                            <div class="text-center">
                                <Button icon="pi pi-times" class="mr-2" severity="danger" text rounded></Button>
                                <Button icon="pi pi-search" text rounded></Button>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.remove-file-wrapper:hover {
    .remove-button {
        display: flex !important;
    }
}
</style>
