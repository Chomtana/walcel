import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateEns {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  ensDomain: string;

  @IsNumber()
  @IsNotEmpty()
  deployId: number;
}
