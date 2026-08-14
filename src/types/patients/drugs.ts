export interface DrugRecordDetail {
  id?: string | number;
  name: string;
  route?: string;
  quantity?: number | string;
  frequency?: string | { value?: string; rate?: string };
  duration?: string | { value?: string; rate?: string };
}
