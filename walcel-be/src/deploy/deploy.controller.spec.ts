import { Test, TestingModule } from '@nestjs/testing';
import { DeployController } from './deploy.controller';
import { DeployService } from './deploy.service';

describe('DeploySrvController', () => {
  let deploySrvController: DeployController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DeployController],
      providers: [DeployService],
    }).compile();

    deploySrvController = app.get<DeployController>(DeployController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(deploySrvController.getHello()).toBe('Hello World!');
    });
  });
});
