export interface FormField {
  id: string;
  type: 'input' | 'textarea';
  label: string;
  required: boolean;
}

export interface FlowNode {
  id: string;
  name: string;
  type: 'start' | 'process' | 'end';
  handler?: string;
}

export interface FormConfig {
  fields: FormField[];
}

export interface FlowConfig {
  nodes: FlowNode[];
}

export interface FormSpecification {
  id?: number;
  name: string;
  formConfig: FormConfig;
  flowConfig: FlowConfig;
}

export interface FormInstanceListItem {
  id: number;
  formSpecId: number;
  formSpecName: string;
  submitter: string;
  handler: string;
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormInstanceDetail {
  id: number;
  formSpecId: number;
  formSpec: FormSpecification;
  formData: Record<string, any>;
  currentStatus: string;
  flowRemarks: string;
  submitter: string;
  handler: string;
  createdAt: string;
  updatedAt: string;
}
