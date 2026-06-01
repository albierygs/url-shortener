import Hashids from "hashids";
import { SALT_HASHID } from "./enviroment.js";

export const hashId = new Hashids(
  SALT_HASHID,
  4,
  "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
);
