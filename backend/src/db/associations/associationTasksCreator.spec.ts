import * as chai from 'chai';
import * as spies from 'chai-spies';
import { expect } from 'chai';
import 'mocha';
import {associationTasksCreator, AssociationTasksCreator} from './associationTasksCreator';
import {IAssociationTask, TaskTypes} from './associationTask.interface';
import {IAssociationDetails} from './associationsHelper';

chai.use(spies);


describe('AssociationTasksCreator', () => {

  let _associationTasksCreator: AssociationTasksCreator;

  beforeEach(function () {
    _associationTasksCreator = associationTasksCreator;
  });

  describe('#prepareAssociationTaskFor()', () => {

    it('should create addAssociationDetails if no in prev and sync is not set', async () => {

      const newAssociationDetailsItem: IAssociationDetails = {
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [],
      };

      const prevAssociationDetailsArray: IAssociationDetails[] = [];

      const tasks: IAssociationTask[] = _associationTasksCreator.prepareAssociationTaskFor(newAssociationDetailsItem,
        prevAssociationDetailsArray);

      expect(tasks.length).to.equal(1);
      expect(tasks[0].taskType).to.equal(TaskTypes.addAssociationDetails);
    });

    it('should create addAssociationDetails if no in prev and sync is set to True', async () => {

      const newAssociationDetailsItem: IAssociationDetails = {
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [],
        sync: true,
      };

      const prevAssociationDetailsArray: IAssociationDetails[] = [];

      const tasks: IAssociationTask[] = _associationTasksCreator.prepareAssociationTaskFor(newAssociationDetailsItem,
        prevAssociationDetailsArray);

      expect(tasks.length).to.equal(1);
      expect(tasks[0].taskType).to.equal(TaskTypes.addAssociationDetails);
    });

    it('should create addAssociationDetails if no prev and sync is set to False', async () => {

      const newAssociationDetailsItem: IAssociationDetails = {
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [{
          "from": "name",
          "to": "name"
        }],
        sync: false,
      };

      const prevAssociationDetailsArray: IAssociationDetails[] = [];

      const tasks: IAssociationTask[] = _associationTasksCreator.prepareAssociationTaskFor(newAssociationDetailsItem,
        prevAssociationDetailsArray);

      console.error(tasks[0].data);

      expect(tasks.length).to.equal(1);
      expect(tasks[0].taskType).to.equal(TaskTypes.addAssociationDetails);
      expect(tasks[0].data.associationDetails.sync).to.equal(false);
    });

    it('should create unsyncAssociationDetails if sync is set to False and prev association exists', async () => {

      const newAssociationDetailsItem: IAssociationDetails = {
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [{
          "from": "name",
          "to": "name"
        }],
        sync: false,
      };

      const prevAssociationDetailsArray: IAssociationDetails[] = [{
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [{
          "from": "name",
          "to": "name"
        }]
      }];

      const tasks: IAssociationTask[] = _associationTasksCreator.prepareAssociationTaskFor(newAssociationDetailsItem,
        prevAssociationDetailsArray);

      expect(tasks.length).to.equal(1);
      expect(tasks[0].taskType).to.equal(TaskTypes.unsyncAssociationDetails);
    });

    it('should create syncAssociationDetails if sync is set to True and prev association exists', async () => {

      const newAssociationDetailsItem: IAssociationDetails = {
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [{
          "from": "name",
          "to": "name"
        }],
        sync: true,
      };

      const prevAssociationDetailsArray: IAssociationDetails[] = [{
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [{
          "from": "name",
          "to": "name"
        }],
        sync: false,
      }];

      const tasks: IAssociationTask[] = _associationTasksCreator.prepareAssociationTaskFor(newAssociationDetailsItem,
        prevAssociationDetailsArray);

      expect(tasks.length).to.equal(1);
      expect(tasks[0].taskType).to.equal(TaskTypes.syncAssociationDetails);
    });

    it('should create syncAssociationDetails if sync is not set and prev association exists', async () => {

      const newAssociationDetailsItem: IAssociationDetails = {
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [{
          "from": "name",
          "to": "name"
        }],
      };

      const prevAssociationDetailsArray: IAssociationDetails[] = [{
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [{
          "from": "name",
          "to": "name"
        }],
        sync: false,
      }];

      const tasks: IAssociationTask[] = _associationTasksCreator.prepareAssociationTaskFor(newAssociationDetailsItem,
        prevAssociationDetailsArray);

      expect(tasks.length).to.equal(1);
      expect(tasks[0].taskType).to.equal(TaskTypes.syncAssociationDetails);
    });

    it('should create mappingModifiedForAssociationDetails if has prev and different mappings', async () => {

      const newAssociationDetailsItem: IAssociationDetails = {
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [{
          "from": "name",
          "to": "name"
        }],
      };

      const prevAssociationDetailsArray: IAssociationDetails[] = [{
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [{
          "from": "test",
          "to": "test"
        }],
      }];

      const tasks: IAssociationTask[] = _associationTasksCreator.prepareAssociationTaskFor(newAssociationDetailsItem,
        prevAssociationDetailsArray);

      expect(tasks.length).to.equal(1);
      expect(tasks[0].taskType).to.equal(TaskTypes.mappingModifiedForAssociationDetails);
    });

    it('should create no tasks if has prev and same mappings', async () => {

      const newAssociationDetailsItem: IAssociationDetails = {
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [{
          "from": "name",
          "to": "name"
        }],
      };

      const prevAssociationDetailsArray: IAssociationDetails[] = [{
        targetType: 'test1',
        targetPath: 'test.path',
        originalPath: 'test.path',
        sourceType: 'test2',
        mappings: [{
          "from": "name",
          "to": "name"
        }],
      }];

      const tasks: IAssociationTask[] = _associationTasksCreator.prepareAssociationTaskFor(newAssociationDetailsItem,
        prevAssociationDetailsArray);

      expect(tasks.length).to.equal(0);
    });
  });
});
