<template>
  <div v-if="notesList && notesList.length">
    <section class="calendar-notes">
      <div class="title">Warning: Busy Dates!</div>
      <template v-for="(note, index) in notesList" :key="index">
        <div v-markdown="{ data: note }" class="note"></div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import { usePackageEventCalendarNotesHelperService } from "~/service/helpers/package-builder/package-event-calendar-notes-helper.service.factory";
import { useEventPackageBuilder } from "~/service/helpers/package-builder/package-builder.service.factory";
import { SITE_AREAS } from "~/service/siteAreas.const";
import { useDataTemplateFabricService } from "~/service/helpers/data-templates/data-template-fabric.factory";

const packageEventCalendarNotesHelperService =
  usePackageEventCalendarNotesHelperService();
const packageBuilder = useEventPackageBuilder();
const dataTemplateFabric = useDataTemplateFabricService();

let packageChangesSubscription;
let packageLoadedSubscription;
const notesTitle = ref(null);
const notesList = ref(null);

async function init() {
  // These notes should be shown to all users viewing the package (https://www.wrike.com/open.htm?id=370124773)
  // if (packageBuilder.getCurrentSiteArea() === SITE_AREAS.supplier) {
  //   return;
  // }

  loadNotesTitle();
  await loadNotesList();

  packageChangesSubscription = packageBuilder.onChanged(async (changed) => {
    if (changed) {
      setTimeout(async () => {
        await loadNotesList();
      }, 300);
    }
  });

  packageLoadedSubscription = packageBuilder.onPackageLoaded(async () => {
    setTimeout(async () => {
      await loadNotesList();
    }, 300);
  });
}

async function loadNotesList() {
  const data = packageBuilder.getViewData();

  if (!data) {
    notesList.value = null;
  } else {
    notesList.value =
      await packageEventCalendarNotesHelperService.getSuitableNotes(data);
  }
}

function loadNotesTitle() {
  const dataTemplate = dataTemplateFabric.get({
    name: "event",
    notUpdateDefaultHeaderTemplate: true,
  });
  notesTitle.value = dataTemplate.getRaw("calendarDateAlert.packageNote.title");
}

onMounted(() => {
  init();
});

onUnmounted(() => {
  if (packageChangesSubscription) {
    packageChangesSubscription.unsubscribe();
  }

  if (packageLoadedSubscription) {
    packageLoadedSubscription.unsubscribe();
  }
});
</script>

<style lang="scss">
.calendar-notes {
 // background: white; /* Inner  Color */
 // padding: 0.5rem;
  margin: 20px 0;
 // border-radius: 3px;
 // text-align: center;
  font-size: 14px;
 // min-width: 250px;

  & .title {
    font-size: 16px;
    text-transform: uppercase;
    font-family: $ff2;
    color: $C1;
  }
}
</style>
