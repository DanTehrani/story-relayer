import arweave, { getWalletKey } from "./arweave";
import sha256 from "crypto-js/sha256";
import config from "../config";
const { APP_ID, APP_VERSION } = config;
import { EIP721TypedMessage, FormInput, Answer } from "types";

import {
  MessageTypes,
  recoverTypedSignature,
  SignTypedDataVersion
} from "@metamask/eth-sig-util";

const isSignatureValid = (
  message: EIP721TypedMessage,
  signature: string,
  address: string
): boolean => {
  try {
    const recoveredAddr = recoverTypedSignature<
      SignTypedDataVersion.V4,
      MessageTypes
    >({
      data: message,
      signature,
      version: SignTypedDataVersion.V4
    });

    return recoveredAddr.toUpperCase() === address.toUpperCase();
  } catch (err) {
    console.error(err);
    return false;
  }
};

/**
 * Verify the signature and create an Arweave tx to upload the form
 */
export const uploadForm = async (formInput: FormInput): Promise<string> => {
  const { signature, eip721TypedMessage } = formInput;
  const form = eip721TypedMessage.message;
  const formId = sha256(form.owner + Date.now());

  if (!isSignatureValid(eip721TypedMessage, signature, form.owner)) {
    throw new Error("Invalid signature");
  }

  const key = await getWalletKey();

  const transaction = await arweave.createTransaction(
    {
      data: JSON.stringify(form, null, 0)
    },
    key
  );

  transaction.addTag("App-Id", APP_ID);
  transaction.addTag("App-Version", APP_VERSION);
  transaction.addTag("Type", "Form");
  transaction.addTag("Form-Id", formId);
  transaction.addTag("Signature", signature); // sign(version, title, questions)
  transaction.addTag("Version", form.version.toString());

  await arweave.transactions.sign(transaction, key);
  await arweave.transactions.post(transaction);

  console.log(transaction.id);

  return transaction.id;
};

export const uploadAnswer = async (
  formId: string,
  submission: Answer[]
): Promise<string> => {
  const key = await getWalletKey();
  const transaction = await arweave.createTransaction(
    {
      data: JSON.stringify(
        {
          submission
        },
        null,
        0
      )
    },
    key
  );

  transaction.addTag("App-Id", APP_ID);
  transaction.addTag("App-Version", APP_VERSION);
  transaction.addTag("Type", "submission");
  transaction.addTag("Form-Id", formId);
  transaction.addTag("Signature", "");
  transaction.addTag("Version", "1");

  /**
   * Verify.
   * Verify that the answer sig is the signature of the whitelisted address.
   * Manage the whitelist secretly.
   * Or, just go with zk snark now.
   */

  await arweave.transactions.sign(transaction, key);
  //  await arweave.transactions.post(transaction);
  console.log(transaction.id);

  return transaction.id;
};