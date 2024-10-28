
// TODO: ***
export enum DeleteArrayItemsAction {
  cancel,
  deleteThisRow,
  deleteThisAndAllRowsBelow,
}


// const template = `
// <base-dialog-with-form headerTitle="Delete Array Items" (close)="cancel()">
//   <p class="text-align_center padding_0_0_1">What should be Deleted?</p>
//
//   <div class="field column center-center">
//     <button mat-button class="primary" (click)="deleteThisRowClick()">
//       Delete this row
//     </button>
//
//     <button mat-button class="primary" (click)="deleteThisAndAllRowsBelowClick()">
//       Delete this and all rows below
//     </button>
//   </div>
// </base-dialog-with-form>
// `;


// export class DeleteArrayItemsDialogComponent {
//
//   deleteThisRowClick() {
//     this.hide(DeleteArrayItemsAction.deleteThisRow);
//   }
//
//   deleteThisAndAllRowsBelowClick() {
//     this.hide(DeleteArrayItemsAction.deleteThisAndAllRowsBelow);
//   }
// }
//
//
// export class DeleteArrayItemsDialog {
//
//   constructor(private matDialog: MatDialog) {
//     //
//   }
//
//   show() {
//     return this.matDialog.open(DeleteArrayItemsDialogComponent).afterClosed();
//   }
// }
