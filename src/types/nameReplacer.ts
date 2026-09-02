export interface NameReplacementRule {
  id: string;
  bookId: string;
  findText: string;
  replaceText: string;
  matchCase: boolean;
  wholeWord: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NameReplacementPreset {
  id: string;
  label: string;
  description: string;
  rules: Array<Omit<NameReplacementRule, 'id' | 'bookId' | 'createdAt' | 'updatedAt'>>;
}
