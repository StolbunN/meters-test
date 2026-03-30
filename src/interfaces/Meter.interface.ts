export interface IMeter {
  id: string;
  area: {
    id: string;
  };
  brand_name: string | null;
  communication: string;
  description: string;
  initial_values: number[];
  installation_date: string;
  is_automatic: boolean | null;
  model_name: string | null;
  serial_number: string;
  _type: [string, string];
}

export interface IMeterData {
  count: number;
  next: string | null;
  previous: string | null;
  results: IMeter[];
}
