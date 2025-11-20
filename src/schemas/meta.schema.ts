import { Prop } from '@nestjs/mongoose';

export class MetaSchema {
  @Prop({
    type: Boolean,
    default: false,
  })
  isDeleted: boolean;

  @Prop({
    type: String,
    required: false,
  })
  deletedAt: string;

  @Prop({
    type: String,
    default: () => new Date().toISOString(),
  })
  createdAt: string;

  @Prop({
    type: String,
    default: () => new Date().toISOString(),
  })
  updatedAt: string;
}
