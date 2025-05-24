import { IsNotEmpty, IsString } from 'class-validator';

export class Redeploy {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  envJson: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}
