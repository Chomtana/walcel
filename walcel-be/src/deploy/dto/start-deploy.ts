import { IsNotEmpty, IsString } from 'class-validator';

export class StartDeploy {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  envJson: string;
}

export interface DeployResponse {
  deployId: number;
  status: string;
}
