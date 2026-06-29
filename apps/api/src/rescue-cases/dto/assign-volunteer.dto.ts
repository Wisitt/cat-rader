import { IsUUID } from "class-validator";

export class AssignVolunteerDto {
  @IsUUID()
  volunteerId!: string;
}
