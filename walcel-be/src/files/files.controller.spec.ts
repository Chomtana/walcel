import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('AppController', () => {
  let appController: FilesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [FilesService],
    }).compile();

    appController = app.get<FilesController>(FilesController);
  });

  // describe('root', () => {
  //   it('should return "Hello World!"', () => {
  //     expect(appController.getHello()).toBe('Hello World!');
  //   });
  // });
});
