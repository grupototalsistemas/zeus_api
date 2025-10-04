
import {Prisma} from '@prisma/client'




export class UpdateLogSystemDto {
  endpoint_name?: string;
device?: string;
user_win?: string;
computer_name?: string;
action_page?: string;
table_name?: string;
table_id_name?: string;
table_id_value?: bigint;
table_id_value_str?: string;
table_data_before?: Prisma.InputJsonValue;
table_data_after?: Prisma.InputJsonValue;
error_status?: number;
error_message?: string;
updatedAt?: Date;
}
