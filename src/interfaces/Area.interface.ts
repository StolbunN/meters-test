export interface IArea {
  id: string;
  number: number;
  str_number: string;
  str_number_full: string;
  house: {
    address: string;
    id: string;
    fias_addrobjs: string[];
  };
}

export interface IAreaData {
  count: number;
  next: string | null;
  previous: string | null;
  results: IArea[];
}
