import { Museo } from "./museo.interface";

export interface MuseosResponse {
  status: number;
  message: string;
  data: {
    data: Museo[];
  };
}