export interface FrameworkInstance {
  id: string;
  templateId: string;
  title: string;
  values: Record<string, string>;
  updatedAt: string;
  updatedBy?: string;
}
