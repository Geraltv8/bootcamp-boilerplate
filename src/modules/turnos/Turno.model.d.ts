import { Document } from 'mongoose';
import type { ITurno } from "./types/Turno.interface";
declare const TurnoModel: import("mongoose").Model<ITurno, {}, {}, {}, Document<unknown, {}, ITurno, {}, import("mongoose").DefaultSchemaOptions> & ITurno & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITurno>;
export default TurnoModel;
//# sourceMappingURL=Turno.model.d.ts.map