<template>
  <tool-dialog title="Preferred Start Time">
    <form name="preferred-start-time-form" @submit.prevent="submit">
      <p class="tool-dialog-text Center">Start Time Preference</p>

      <div class="preferred-start-time-form-controls Column Between">
        <CSFormField>
          <LazyCSSelect v-model="dataState.selectedTime"
                    :options="dataState.possibleTimeList"
                    label="label"
                    placeholder="Time">
          </LazyCSSelect>
        </CSFormField>

        <div class="Row Row-Between Grow preferred-start-time-form-offset-control">
          <p class="tool-dialog-text Center">+/-</p>
          <CSFormField>
            <LazyCSSelect v-model="dataState.offset"
                      :options="dataState.possibleOffsetList"
                      label="label">
            </LazyCSSelect>
          </CSFormField>
          <p class="tool-dialog-text Center">Hour</p>
        </div>
      </div>

      <p v-show="dataState.allowTime" class="tool-dialog-text Center">
        Allow approximately {{ getAllowTimeStringInHours(dataState.allowTime) }} for this event
      </p>

      <button-main type="submit" >OK</button-main>
    </form>
  </tool-dialog>
</template>

<script lang="ts">
import * as _ from "~/services/cs-lodash";
import {useDateHelper} from '~/services/helpers/date-helper.factory';
import {useDialogData, useDialogInstance} from '~/services/dialog/core/dialog.composables';


export interface PreferredStartTimeDialogData {
  possibleTimeList: Date[];
  possibleOffsetList: number[];
  allowTime: number;
  startTime: Date;
  preferredStartTimeRange: number;
}


export interface PreferredStartTimeDialogResult {
  preferredTime: Date;
  preferredStartTimeRange: number;
}


export interface PreferredStartTimeDialogDataState {
  possibleTimeList: {value: Date; label: string;}[];
  possibleOffsetList: number[];
  selectedTime: {value: Date; label: string;};
  offset: number;
  allowTime: number;
}


export default {
  setup() {
    const dialogData = useDialogData<PreferredStartTimeDialogData>();
    const dialogInstance = useDialogInstance<PreferredStartTimeDialogResult>();
    const dateHelper = useDateHelper();

    const possibleTimeList = dialogData.possibleTimeList.map(value => ({value, label: getPossibleTimeString(value)}));
    const selectedTime = possibleTimeList
      .find(({value}) => _.isEqual(dateHelper.viewTimeFormat(value), dateHelper.viewTimeFormat(dialogData.startTime)));

    const dataState = reactive<PreferredStartTimeDialogDataState>({
      possibleOffsetList: dialogData.possibleOffsetList,
      offset: dialogData.preferredStartTimeRange,
      allowTime: dialogData.allowTime,
      possibleTimeList,
      selectedTime,
    });


    function getPossibleTimeString(date: Date): string {
      return dateHelper.viewTimeFormat(date);
    }


    function getAllowTimeStringInHours(timeToAllowMinutes: number): string {
      if (_.isUndefined(timeToAllowMinutes)) {
        return '';
      }

      let resultArray = [];

      let hours = Math.floor(timeToAllowMinutes / 60);
      let minutes = timeToAllowMinutes % 60;

      let hoursStr = (hours > 0) ? `${hours} ${(hours > 1) ? 'hours' : 'hour'}` : null;

      if (hoursStr !== null) {
        resultArray.push(hoursStr);
      }

      let minutesStr = (minutes > 0) ? `${minutes} ${(minutes > 1) ? 'minutes' : 'minute'}` : null;

      if (minutesStr !== null) {
        resultArray.push(minutesStr);
      }

      return resultArray.join(' ');
    }


    function submit(): void {
      dialogInstance.close({
        preferredTime: dataState.selectedTime.value as Date,
        preferredStartTimeRange: dataState.offset,
      });
    }


    return {
      dataState,
      submit: () => submit(),
      getPossibleTimeString: d => getPossibleTimeString(d),
      getAllowTimeStringInHours: t => getAllowTimeStringInHours(t)
    }
  }
}
</script>

<style lang="scss">
.preferred-start-time-form {
  &-controls {
    width: 70%;
    gap: 20px;
  }

  &-offset-control {
    gap: 5px;
  }
}
</style>
