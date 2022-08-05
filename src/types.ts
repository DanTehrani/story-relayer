import { Request } from "express";

// Form

export type FormCustomAttribute = {
  key: string;
  value: string;
};

export type FormQuestion = {
  label: string;
  type: string;
  customerAttributes: FormCustomAttribute[];
};

export type Form = {
  id: string;
  title: string;
  version: string;
  questions: FormQuestion[];
  owner: string;
};

export type EIP721TypedMessage = {
  domain: {
    [additionalProperties: string]: string;
  };
  types: {
    EIP712Domain: {
      name: string;
      type: string;
    }[];
    [additionalProperties: string]: {
      name: string;
      type: string;
    }[];
  };
  primaryType: string;
  message: Form;
};

export type FormInput = {
  signature: string;
  eip712TypedMessage: {
    domain: {
      [additionalProperties: string]: string;
    };
    types: {
      [additionalProperties: string]: {
        name: string;
        type: string;
      }[];
    };
    value: {
      title: string;
      version: number;
      questions: string;
      owner: string;
    };
  };
};

// Submission/Answer

export type Answer = string;

export type CreateFormRequestBody = {
  body: {
    signature: string;
  };
};

export type CreateFormRequest = {
  body: CreateFormRequestBody;
} & Request;

export type FormSubmissionInput = {
  formId: string;
  answers: Answer[];
  submissionId: string;
  dataSubmissionProof: string;
  membershipProof: string;
};

export type SubmitAnswerRequestBody = {
  body: FormSubmissionInput;
};
